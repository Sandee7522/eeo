const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DELAY_MS = 3000;
const NAV_TIMEOUT = 30000;
const MAX_JOBS = 5;
const OUTPUT_FILE = path.join(__dirname, "../../data/remoteok_jobs.json");

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Email extraction ─────────────────────────────────────────────────────────

const EMAIL_BLACKLIST_EXT = [".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".css", ".js", ".woff", ".woff2", ".map", ".ts", ".jsx", ".tsx"];
const EMAIL_BLACKLIST_DOMAINS = [
  "example.com", "yoursite.com", "yourdomain.com", "email.com",
  "sentry.io", "webpack.js", "w3.org", "schema.org", "googleapis.com",
  "cloudflare.com", "gravatar.com", "shields.io", "badge.fury.io",
  "travis-ci.org", "github.com", "npmjs.com", "placeholder.com",
  "test.com", "localhost", "127.0.0.1",
];
// Tracking/generated email patterns (noreply, pixel trackers, UUID-based)
const EMAIL_FAKE_PATTERNS = [
  /^noreply@/i, /^no-reply@/i, /^donotreply@/i, /^mailer-daemon@/i,
  /^postmaster@/i, /^webmaster@/i, /^root@/i, /^admin@localhost/i,
  /^[a-f0-9]{24,}@/i,         // hex hash addresses (tracking pixels)
  /^[0-9]+@/,                  // numeric-only local parts
  /\+.*@/,                     // sub-addressed / tagged emails
  /@.*\.local$/i,              // .local domains
  /^user@/i, /^test@/i, /^foo@/i, /^bar@/i, /^sample@/i,
];

function extractEmails(text) {
  const results = [];

  // Priority 1: mailto: links (most intentional)
  const mailtoRegex = /mailto:([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
  let m;
  while ((m = mailtoRegex.exec(text)) !== null) {
    results.push(m[1]);
  }

  // Priority 2: general email regex
  const generalRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const general = text.match(generalRegex) || [];
  results.push(...general);

  // Dedupe, normalize, and filter
  const seen = new Set();
  return results
    .map((e) => e.toLowerCase().trim())
    .filter((e) => {
      if (seen.has(e)) return false;
      seen.add(e);
      if (e.length < 6 || e.length > 80) return false;
      if (EMAIL_BLACKLIST_EXT.some((ext) => e.endsWith(ext))) return false;
      if (EMAIL_BLACKLIST_DOMAINS.some((d) => e.includes(d))) return false;
      if (EMAIL_FAKE_PATTERNS.some((p) => p.test(e))) return false;
      // Must have a valid-looking TLD (at least 2 alpha chars after last dot)
      const tld = e.split(".").pop();
      if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) return false;
      return true;
    });
}

// ── Phone number extraction ──────────────────────────────────────────────────

// Strict intl phone regex: must start with + country code, then grouped digits
// Matches: +1 (555) 123-4567, +44 20 7946 0958, +91-98765-43210, etc.
const INTL_PHONE_REGEX = /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}(?:[-.\s]?\d{1,4})?/g;

function isValidPhoneNumber(raw) {
  const digits = raw.replace(/\D/g, "");

  // Must be 10–15 digits (E.164 standard)
  if (digits.length < 10 || digits.length > 15) return false;

  // Reject decimals / coordinates (e.g. "40.7128" or "73.9352")
  if (/\d+\.\d+\.\d+/.test(raw)) return false; // IP-like
  if (/^[+-]?\d+\.\d{4,}/.test(raw)) return false; // high-precision decimal

  // Reject timestamps (13-digit epoch, or date-like patterns)
  if (/^\d{13}$/.test(digits)) return false;
  if (/20[0-2]\d[01]\d[0-3]\d/.test(digits)) return false; // YYYYMMDD embedded

  // Reject repeating digits (e.g. +1 000 000 0000, +1 111 111 1111)
  if (/^(\d)\1+$/.test(digits)) return false;
  // Reject sequential (1234567890...)
  if (/^0?1234567890/.test(digits)) return false;

  // Reject if it looks like a long continuous ID (no separators in a 12+ char string)
  if (digits.length >= 12 && !/[-.\s()]/.test(raw.slice(1))) return false;

  return true;
}

function normalizePhone(raw) {
  // Strip all whitespace, dashes, dots, parens — keep + and digits
  return raw.replace(/[^\d+]/g, "");
}

function extractPhoneNumbers(telHrefs, visibleText) {
  const priority1 = []; // tel: href links (highest confidence)
  const priority2 = []; // near contact keywords
  const priority3 = []; // regex fallback

  // ── Priority 1: tel: href links ──
  const telRegex = /tel:\+?([\d\s\-().+]{7,})/gi;
  let tm;
  while ((tm = telRegex.exec(telHrefs)) !== null) {
    let num = tm[1].trim();
    if (!num.startsWith("+")) num = "+" + num;
    if (isValidPhoneNumber(num)) {
      priority1.push(normalizePhone(num));
    }
  }

  // ── Priority 2 & 3: from visible text (no scripts/styles) ──
  const CONTACT_KW = /(?:contact|call\s+us|phone|support|tel|fax|helpline|reach\s+us|get\s+in\s+touch|customer\s+service)/i;
  const lines = visibleText.split(/\n/);

  for (let i = 0; i < lines.length; i++) {
    // 3-line context window for keyword proximity
    const ctxStart = Math.max(0, i - 2);
    const ctxEnd = Math.min(lines.length - 1, i + 2);
    const context = lines.slice(ctxStart, ctxEnd + 1).join(" ");
    const nearKeyword = CONTACT_KW.test(context);

    let match;
    INTL_PHONE_REGEX.lastIndex = 0;
    while ((match = INTL_PHONE_REGEX.exec(lines[i])) !== null) {
      const raw = match[0].trim();
      if (!isValidPhoneNumber(raw)) continue;
      const normalized = normalizePhone(raw);

      if (nearKeyword) {
        priority2.push(normalized);
      } else {
        priority3.push(normalized);
      }
    }
  }

  // Dedupe across all priorities, maintaining order
  const seen = new Set();
  const result = [];
  for (const num of [...priority1, ...priority2, ...priority3]) {
    if (!seen.has(num)) {
      seen.add(num);
      result.push(num);
    }
  }
  return result;
}

// ── Step 1: Scrape RemoteOK via JSON API ─────────────────────────────────────

async function scrapeRemoteOKJobs(browser) {
  console.log("[1/6] Fetching RemoteOK jobs via API...");

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  await page.goto("https://remoteok.com/api", {
    waitUntil: "networkidle2",
    timeout: NAV_TIMEOUT,
  });

  // Get JSON from the page
  const rawText = await page.evaluate(() => document.body.innerText);
  await page.close();

  let apiData;
  try {
    apiData = JSON.parse(rawText);
  } catch {
    console.error("   Failed to parse RemoteOK API response");
    return [];
  }

  // First element is metadata, rest are jobs
  const jobEntries = apiData.filter((item) => item.id && item.position);
  const jobs = [];

  for (const entry of jobEntries) {
    if (jobs.length >= MAX_JOBS) break;

    const job = {
      jobTitle: entry.position || "",
      companyName: entry.company || "",
      jobUrl: entry.url
        ? (entry.url.startsWith("http") ? entry.url : `https://remoteok.com${entry.url}`)
        : "",
      applyUrl: entry.apply_url || null,
      location: entry.location || "Remote",
      salary: entry.salary_min && entry.salary_max
        ? `$${entry.salary_min} - $${entry.salary_max}`
        : null,
      tags: entry.tags || [],
      postedDate: entry.date || null,
      companyWebsite: null,
      emails: [],
      phoneNumbers: [],
    };

    if (job.jobTitle && job.companyName) {
      jobs.push(job);

      console.log(`\n   ── Job ${jobs.length} ──`);
      console.log(`   Title:    ${job.jobTitle}`);
      console.log(`   Company:  ${job.companyName}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Salary:   ${job.salary || "N/A"}`);
      console.log(`   Tags:     ${job.tags.join(", ") || "N/A"}`);
      console.log(`   Posted:   ${job.postedDate || "N/A"}`);
      console.log(`   URL:      ${job.jobUrl}`);
      console.log(`   ApplyURL: ${job.applyUrl || "N/A"}`);
    }
  }

  console.log(`\n   Found ${jobs.length} jobs from API.`);
  return jobs;
}

// ── Step 2: Find company website via Google Search ───────────────────────────

const SEARCH_BLACKLIST = [
  "google.", "youtube.", "facebook.", "twitter.", "x.com", "linkedin.",
  "instagram.", "pinterest.", "reddit.", "wikipedia.", "glassdoor.",
  "indeed.", "crunchbase.", "angel.co", "wellfound.", "medium.",
  "github.", "remoteok.", "asyncok.", "aiok.", "lever.co",
  "greenhouse.io", "workable.com", "tiktok.", "yelp.", "duckduckgo.",
];

// Try to guess the company domain directly (e.g. "OpenAI" → openai.com)
async function tryDirectDomain(browser, companyName) {
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const candidates = [
    `https://${slug}.com`,
    `https://${slug}.io`,
    `https://www.${slug}.com`,
  ];

  const page = await browser.newPage();
  try {
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    for (const url of candidates) {
      try {
        const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
        if (resp && resp.status() < 400) {
          const finalHost = new URL(page.url()).hostname.toLowerCase();
          const isBlacklisted = SEARCH_BLACKLIST.some((d) => finalHost.includes(d));
          if (!isBlacklisted) {
            return `https://${finalHost}`;
          }
        }
      } catch {
        // domain doesn't resolve — try next
      }
    }
    return null;
  } finally {
    await page.close();
  }
}

// Search via DuckDuckGo (much less bot-detection than Google)
async function searchDuckDuckGo(browser, companyName) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const query = encodeURIComponent(`${companyName} official website`);
    await page.goto(`https://html.duckduckgo.com/html/?q=${query}`, {
      waitUntil: "networkidle2",
      timeout: NAV_TIMEOUT,
    });

    await sleep(1000);

    // DuckDuckGo HTML version has result links in .result__a
    const results = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll("a.result__a").forEach((a) => {
        const href = a.href;
        if (href && href.startsWith("http")) {
          links.push(href);
        }
      });
      return links;
    });

    for (const url of results) {
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        const isBlacklisted = SEARCH_BLACKLIST.some((d) => hostname.includes(d));
        if (!isBlacklisted && hostname.length >= 4) {
          return `${parsed.protocol}//${parsed.hostname}`;
        }
      } catch {}
    }

    return null;
  } catch (err) {
    console.log(`      DuckDuckGo search failed: ${err.message}`);
    return null;
  } finally {
    await page.close();
  }
}

async function findCompanyWebsite(browser, companyName) {
  // Strategy 1: Try direct domain guess (fastest)
  const direct = await tryDirectDomain(browser, companyName);
  if (direct) return direct;

  // Strategy 2: Search via DuckDuckGo
  const ddg = await searchDuckDuckGo(browser, companyName);
  if (ddg) return ddg;

  return null;
}

async function enrichJobDetails(browser, job) {
  // Find company website via Google
  const website = await findCompanyWebsite(browser, job.companyName);
  if (website) {
    job.companyWebsite = website;
  }

  console.log(`      Company Website: ${job.companyWebsite || "not found"}`);
  return job;
}

// ── Step 3 & 4: Crawl company website and extract contacts ───────────────────

const CONTACT_PATHS = [
  "/",
  "/contact",
  "/contact-us",
  "/about",
  "/about-us",
  "/support",
  "/company",
  "/team",
  "/impressum",
];

async function extractContactsFromPage(page) {
  const emails = [];
  const phones = [];

  try {
    await sleep(2000);

    // Scroll to bottom to load lazy content (footer usually has contacts)
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
        setTimeout(() => { clearInterval(timer); resolve(); }, 3000);
      });
    });

    // Get visible text only (excludes script/style content)
    const visibleText = await page.evaluate(() => document.body.innerText || "");

    // Get all href values separately for tel: and mailto: extraction
    const hrefData = await page.evaluate(() => {
      const hrefs = [];
      document.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href") || "";
        hrefs.push(href);
      });
      return hrefs.join(" ");
    });

    // Emails: use visible text + hrefs (no raw HTML to avoid false positives)
    const emailSource = visibleText + " " + hrefData;
    emails.push(...extractEmails(emailSource));

    // Phones: tel: hrefs as priority 1, visible text for priority 2 & 3
    phones.push(...extractPhoneNumbers(hrefData, visibleText));
  } catch {
    // page crash or navigation error
  }

  return { emails, phones };
}

async function crawlCompanyWebsite(browser, job) {
  if (!job.companyWebsite) return job;

  const allEmails = new Set();
  const allPhones = new Set();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Block heavy resources to speed up
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "font", "media"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Try each contact path
    for (const p of CONTACT_PATHS) {
      const url = `${job.companyWebsite}${p}`;
      try {
        const response = await page.goto(url, {
          waitUntil: "networkidle2",
          timeout: NAV_TIMEOUT,
        });

        if (!response || response.status() >= 400) continue;

        console.log(`      Crawling: ${url} → ${response.status()}`);

        const { emails, phones } = await extractContactsFromPage(page);
        emails.forEach((e) => allEmails.add(e));
        phones.forEach((p) => allPhones.add(p));

        if (allEmails.size > 0) {
          console.log(`      ✓ Found emails: ${[...allEmails].join(", ")}`);
        }
        if (allPhones.size > 0) {
          console.log(`      ✓ Found phones: ${[...allPhones].join(", ")}`);
        }

        // Stop early if we found enough
        if (allEmails.size >= 3) break;
      } catch {
        // timeout or connection error — skip this path
      }
    }

    // If no emails found, try to discover contact page from homepage links
    if (allEmails.size === 0) {
      try {
        await page.goto(job.companyWebsite, {
          waitUntil: "networkidle2",
          timeout: NAV_TIMEOUT,
        });

        const contactLinks = await page.evaluate(() => {
          const links = [];
          document.querySelectorAll("a").forEach((a) => {
            const text = (a.textContent || "").toLowerCase();
            const href = a.href || "";
            if (
              (text.includes("contact") ||
                text.includes("get in touch") ||
                text.includes("reach") ||
                text.includes("support") ||
                text.includes("help")) &&
              href.startsWith("http")
            ) {
              links.push(href);
            }
          });
          return [...new Set(links)].slice(0, 3);
        });

        for (const link of contactLinks) {
          try {
            const resp = await page.goto(link, {
              waitUntil: "networkidle2",
              timeout: NAV_TIMEOUT,
            });
            if (resp && resp.status() < 400) {
              console.log(`      Crawling (auto-discovered): ${link}`);
              const { emails, phones } = await extractContactsFromPage(page);
              emails.forEach((e) => allEmails.add(e));
              phones.forEach((p) => allPhones.add(p));
            }
          } catch {}
        }
      } catch {}
    }
  } catch (err) {
    console.warn(`   ⚠ Failed to crawl ${job.companyWebsite}: ${err.message}`);
  } finally {
    await page.close();
  }

  job.emails = [...allEmails];
  job.phoneNumbers = [...allPhones];
  return job;
}

// ── Step 5: Save results ─────────────────────────────────────────────────────

function saveResults(jobs) {
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jobs, null, 2), "utf-8");
  console.log(`\n[✓] JSON saved to ${OUTPUT_FILE}`);
}

// ── Step 6: Save to Database ─────────────────────────────────────────────────

async function saveToDatabase(jobs) {
  console.log("\n[DB] Saving jobs to database...");
  let saved = 0;
  let skipped = 0;

  for (const job of jobs) {
    try {
      // Check if this job already exists in DB
      const existing = await prisma.remoteJob.findUnique({
        where: {
          jobTitle_companyName: {
            jobTitle: job.jobTitle,
            companyName: job.companyName,
          },
        },
      });

      if (existing) {
        // Only update fields that have new non-empty data
        // Never overwrite existing data with null/empty
        const updateData = {};
        if (job.jobUrl) updateData.jobUrl = job.jobUrl;
        if (job.applyUrl) updateData.applyUrl = job.applyUrl;
        if (job.location) updateData.location = job.location;
        if (job.salary) updateData.salary = job.salary;
        if (job.tags && job.tags.length > 0) updateData.tags = job.tags;
        if (job.postedDate) updateData.postedDate = job.postedDate;
        if (job.companyWebsite) updateData.companyWebsite = job.companyWebsite;
        if (job.emails && job.emails.length > 0) updateData.emails = job.emails;
        if (job.phoneNumbers && job.phoneNumbers.length > 0) updateData.phoneNumbers = job.phoneNumbers;

        if (Object.keys(updateData).length > 0) {
          await prisma.remoteJob.update({
            where: {
              jobTitle_companyName: {
                jobTitle: job.jobTitle,
                companyName: job.companyName,
              },
            },
            data: updateData,
          });
          console.log(`   [✓] Updated: ${job.jobTitle} @ ${job.companyName}`);
        } else {
          console.log(`   [—] No new data: ${job.jobTitle} @ ${job.companyName}`);
        }
      } else {
        // New job — insert all fields
        await prisma.remoteJob.create({
          data: {
            jobTitle: job.jobTitle,
            companyName: job.companyName,
            jobUrl: job.jobUrl,
            applyUrl: job.applyUrl,
            location: job.location,
            salary: job.salary,
            tags: job.tags || [],
            postedDate: job.postedDate,
            companyWebsite: job.companyWebsite,
            emails: job.emails || [],
            phoneNumbers: job.phoneNumbers || [],
          },
        });
        console.log(`   [✓] Saved: ${job.jobTitle} @ ${job.companyName}`);
      }
      saved++;
    } catch (err) {
      skipped++;
      console.error(`   [✗] Failed: ${job.jobTitle} @ ${job.companyName} — ${err.message}`);
    }
  }

  console.log(`\n[DB] Done — Saved: ${saved}, Failed: ${skipped}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Starting RemoteOK scraper...\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    // Step 1: Fetch jobs from API
    const jobs = await scrapeRemoteOKJobs(browser);
    if (jobs.length === 0) {
      console.log("No jobs found. Exiting.");
      return;
    }

    // Step 2: Find real company websites via Google
    console.log("\n[2/6] Finding company websites via Google Search...");
    const searchedCompanies = new Map();
    for (let i = 0; i < jobs.length; i++) {
      const name = jobs[i].companyName;
      console.log(`   [${i + 1}/${jobs.length}] Searching for "${name}"...`);

      if (searchedCompanies.has(name)) {
        jobs[i].companyWebsite = searchedCompanies.get(name);
        console.log(`      (cached) ${jobs[i].companyWebsite || "not found"}`);
      } else {
        await enrichJobDetails(browser, jobs[i]);
        searchedCompanies.set(name, jobs[i].companyWebsite);
        await sleep(DELAY_MS);
      }
    }

    // Step 3 & 4: Crawl company websites for emails & phone numbers
    console.log("\n[3/6] Crawling company websites for contact info...");
    const visited = new Set();
    for (let i = 0; i < jobs.length; i++) {
      const site = jobs[i].companyWebsite;
      if (!site || visited.has(site)) {
        if (site && visited.has(site)) {
          const source = jobs.find(
            (j) =>
              j.companyWebsite === site &&
              (j.emails.length > 0 || j.phoneNumbers.length > 0)
          );
          if (source) {
            jobs[i].emails = [...source.emails];
            jobs[i].phoneNumbers = [...source.phoneNumbers];
          }
        }
        continue;
      }
      visited.add(site);
      console.log(`\n   [${visited.size}] Crawling ${site} (${jobs[i].companyName})...`);
      await crawlCompanyWebsite(browser, jobs[i]);
      console.log(`      Result → Emails: ${jobs[i].emails.length}, Phones: ${jobs[i].phoneNumbers.length}`);
      await sleep(DELAY_MS);
    }

    // Step 5: Save to JSON
    console.log("\n[4/6] Saving results to JSON...");
    saveResults(jobs);

    // Step 6: Save to database
    console.log("\n[5/6] Saving results to database...");
    await saveToDatabase(jobs);

    // Summary
    const withEmails = jobs.filter((j) => j.emails.length > 0).length;
    const withPhones = jobs.filter((j) => j.phoneNumbers.length > 0).length;
    const withWebsite = jobs.filter((j) => j.companyWebsite).length;

    console.log("\n[6/6] Summary:");
    console.log(`   Total jobs scraped:          ${jobs.length}`);
    console.log(`   Jobs with company website:   ${withWebsite}`);
    console.log(`   Jobs with emails found:      ${withEmails}`);
    console.log(`   Jobs with phone numbers:     ${withPhones}`);

    // Print all found contacts
    if (withEmails > 0 || withPhones > 0) {
      console.log("\n   ── Contact Details Found ──");
      jobs.forEach((j) => {
        if (j.emails.length > 0 || j.phoneNumbers.length > 0) {
          console.log(`\n   ${j.companyName} (${j.companyWebsite})`);
          if (j.emails.length > 0) console.log(`     Emails: ${j.emails.join(", ")}`);
          if (j.phoneNumbers.length > 0) console.log(`     Phones: ${j.phoneNumbers.join(", ")}`);
        }
      });
    }
  } catch (err) {
    console.error("Scraper failed:", err);
  } finally {
    await browser.close();
    await prisma.$disconnect();
    console.log("\nDone.");
  }
}

module.exports = { main, scrapeRemoteOKJobs, enrichJobDetails, crawlCompanyWebsite, saveToDatabase };

// Run directly with: node src/services/remoteOK.js
if (require.main === module) {
  main();
}
