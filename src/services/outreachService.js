const { PrismaClient } = require("@prisma/client");
const { generateColdEmail } = require("./geminiService");
const { sendEmail } = require("./emailService");

const prisma = new PrismaClient();

/**
 * Mask email address for safe logging (e.g., user@example.com → u***@example.com).
 */
function maskEmail(email) {
  if (!email || typeof email !== "string") return "***@***";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "***@***";
  const masked = localPart.charAt(0) + "*".repeat(Math.max(3, localPart.length - 1)) + "@" + domain;
  return masked;
}

/**
 * Mark companies as leads.
 * emailType = "job_application" → all companies with email (website wali bhi)
 * emailType = "website_offer" → only companies without website but with email
 */
async function detectLeads(emailType = "job_application") {
  const conditions = [
    { email: { not: null } },
    { email: { not: "" } },
    { isLead: false },
    { mailSent: false },
  ];

  // For website_offer, only target companies without website
  if (emailType === "website_offer") {
    conditions.push({ OR: [{ website: null }, { website: "" }] });
  }

  const result = await prisma.company.updateMany({
    where: { AND: conditions },
    data: { isLead: true },
  });

  console.log(`  🔍 Lead detection (${emailType}): found ${result.count} new leads`);

  const totalWithEmail = await prisma.company.count({
    where: { AND: [{ email: { not: null } }, { email: { not: "" } }] },
  });
  console.log(`  📊 DB Stats — Companies with email: ${totalWithEmail}`);

  return result.count;
}

/**
 * Get all leads that haven't been emailed yet.
 */
async function getUnsentLeads({ limit = 10 } = {}) {
  const leads = await prisma.company.findMany({
    where: {
      AND: [
        { isLead: true },
        { mailSent: false },
        { email: { not: null } },
        { email: { not: "" } },
      ],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  console.log(`  📋 Unsent leads found: ${leads.length}`);
  leads.forEach((l, i) => console.log(`    ${i + 1}. ${l.name} → ${maskEmail(l.email)}`));
  return leads;
}

/**
 * Process a single lead: generate email via Gemini → send via SMTP → update DB.
 */
async function processLead(company, emailType = "job_application") {
  try {
    // Generate personalized email
    console.log(`    📝 Generating email via Gemini (${emailType})...`);
    const emailContent = await generateColdEmail(company, emailType);
    console.log(`    ✅ Email generated — Subject: "${emailContent.subject}"`);
    console.log(`    📨 Summary: ${emailContent.summary}`);

    // Collect all emails — primary + array
    const allEmails = new Set();
    if (company.email) allEmails.add(company.email);
    if (Array.isArray(company.emails)) {
      company.emails.forEach((e) => { if (e && typeof e === "string") allEmails.add(e); });
    }
    const emailList = [...allEmails];

    // Send to all emails
    console.log(`    📤 Sending to ${emailList.length} email(s): ${emailList.map(maskEmail).join(", ")}`);
    for (const toEmail of emailList) {
      const sendResult = await sendEmail({
        to: toEmail,
        subject: emailContent.subject,
        body: emailContent.body,
      });
      console.log(`    ✅ Sent to ${maskEmail(toEmail)} | MessageID: ${sendResult.messageId}`);
    }

    // Mark as sent
    await prisma.company.update({
      where: { id: company.id },
      data: {
        mailSent: true,
        mailSubject: emailContent.subject,
        mailBody: emailContent.body,
        mailSummary: emailContent.summary,
        mailError: null,
        mailSentAt: new Date(),
      },
    });

    console.log(`    ✅ DB updated — mailSent: true (${emailList.length} email(s))`);
    return { success: true, company: company.name, email: company.email, totalEmails: emailList.length };
  } catch (err) {
    // Mark as failed
    await prisma.company.update({
      where: { id: company.id },
      data: {
        mailSent: false,
        mailError: err.message?.slice(0, 500) || "Unknown error",
      },
    });

    return { success: false, company: company.name, error: err.message };
  }
}

/**
 * Run full outreach pipeline:
 * 1. Detect leads (no website + has email)
 * 2. Process each unsent lead
 * Returns summary stats.
 */
async function runOutreach({ limit = 10, delayMs = 5000, emailType = "job_application" } = {}) {
  console.log(`\n--- Outreach Pipeline (${emailType}) ---`);

  // Step 1: Detect new leads
  const newLeads = await detectLeads(emailType);
  console.log(`Detected ${newLeads} new leads`);

  // Step 2: Get unsent leads
  const leads = await getUnsentLeads({ limit });
  console.log(`Processing ${leads.length} unsent leads...`);

  let sent = 0;
  let failed = 0;
  const results = [];

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    console.log(`\n  [${i + 1}/${leads.length}] ${lead.name} → ${maskEmail(lead.email)}`);

    const result = await processLead(lead, emailType);
    results.push(result);

    if (result.success) {
      sent++;
      console.log(`    Sent!`);
    } else {
      failed++;
      console.log(`    Failed: ${result.error}`);
    }

    // Delay between emails to avoid rate limiting
    if (i < leads.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  console.log(`\nOutreach done — Sent: ${sent}, Failed: ${failed}`);
  return { newLeads, processed: leads.length, sent, failed, results };
}

/**
 * Get outreach stats from DB.
 */
async function getOutreachStats() {
  const emailFilter = { AND: [{ email: { not: null } }, { email: { not: "" } }] };

  const [totalLeads, emailsSent, emailsFailed, pending, potentialLeads] = await Promise.all([
    prisma.company.count({ where: { isLead: true } }),
    prisma.company.count({ where: { isLead: true, mailSent: true } }),
    prisma.company.count({ where: { isLead: true, mailSent: false, mailError: { not: null } } }),
    prisma.company.count({ where: { isLead: true, mailSent: false, mailError: null } }),
    // Count companies with email that haven't been processed yet
    prisma.company.count({ where: { ...emailFilter, isLead: false, mailSent: false } }),
  ]);

  return {
    totalLeads: totalLeads + potentialLeads,
    emailsSent,
    emailsFailed,
    pending: pending + potentialLeads,
  };
}

/**
 * Get outreach history (companies with mail activity).
 */
async function getOutreachHistory({ page = 1, limit = 10, status } = {}) {
  page = Math.max(1, Math.floor(page));
  limit = Math.max(1, Math.min(100, Math.floor(limit))); // cap at 100
  const where = { isLead: true };
  if (status === "sent") where.mailSent = true;
  if (status === "failed") {
    where.mailSent = false;
    where.mailError = { not: null };
  }
  if (status === "pending") {
    where.mailSent = false;
    where.mailError = null;
  }

  const [data, total] = await Promise.all([
    prisma.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        country: true,
        rating: true,
        mailSent: true,
        mailSubject: true,
        mailSummary: true,
        mailError: true,
        mailSentAt: true,
      },
      orderBy: { mailSentAt: { sort: "desc", nulls: "last" } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

module.exports = {
  detectLeads,
  getUnsentLeads,
  processLead,
  runOutreach,
  getOutreachStats,
  getOutreachHistory,
};
