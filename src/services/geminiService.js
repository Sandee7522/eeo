const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log("🤖 Gemini initialized", genAI);

const MAX_RETRIES = 3;
const MAX_INPUT_LENGTH = 200;

/**
 * Sanitize user input to prevent prompt injection attacks.
 * - Trims to safe max length
 * - Removes/escapes control sequences and newlines
 * - Removes instruction-like phrases
 * - Enforces safe defaults
 */
function sanitizePromptInput(input) {
  if (!input || typeof input !== "string") return "";
  
  // Trim to max length and normalize whitespace
  let sanitized = input.slice(0, MAX_INPUT_LENGTH).trim();
  
  // Remove control sequences and problematic whitespace
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, "").replace(/\n|\r|\t/g, " ");
  
  // Remove instruction-like phrases that could attempt prompt injection
  const injection_patterns = [
    /ignore (previous |prior )?(instructions?|rules?|guidelines?|prompts?)/gi,
    /system ?prompt/gi,
    /reset (your )?instructions?/gi,
    /forget (the |your )?(system |original )?prompt/gi,
    /you are now/gi,
    /act as/gi,
    /forget everything/gi,
  ];
  
  for (const pattern of injection_patterns) {
    sanitized = sanitized.replace(pattern, "");
  }
  
  // Collapse multiple spaces
  sanitized = sanitized.replace(/\s{2,}/g, " ").trim();
  
  return sanitized || "Not provided";
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateColdEmail(business, emailType = "job_application") {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  // Sanitize all untrusted input fields
  const safeName = sanitizePromptInput(business.name);
  const safeCategory = sanitizePromptInput(business.category || "General Business");
  const safeCity = sanitizePromptInput(business.city || "");
  const safeState = sanitizePromptInput(business.state || "");
  const safeCountry = sanitizePromptInput(business.country || "");
  const safePhone = sanitizePromptInput(String(business.phone || ""));
  const safeRating = typeof business.rating === "number" ? business.rating.toFixed(1) : "N/A";
  const safeTotalReviews = typeof business.totalReviews === "number" ? business.totalReviews : "N/A";

  // Build location string with sanitized values
  const locationParts = [safeCity, safeState, safeCountry].filter(Boolean);
  const safeLocation = locationParts.join(", ") || "Not provided";

  let prompt;

  if (emailType === "job_application") {
    prompt = `You are Sandeep Sahu, a Full Stack Developer looking for job opportunities.

Generate a personalized cold email to apply for a Full Stack Developer position at the following company.

Company Details:
- Company Name: ${safeName}
- Category/Industry: ${safeCategory}
- Location: ${safeLocation}
- Rating: ${safeRating} stars (${safeTotalReviews} reviews)

About Sandeep Sahu:
- Full Stack Developer with expertise in React.js, Next.js, Node.js, Express.js, MongoDB, MySQL, Prisma
- Experience with Tailwind CSS, REST APIs, Puppeteer (web scraping), Git
- Passionate about building scalable web applications
- Available for immediate joining
- Based in India

Requirements:
1. Keep it short and professional (under 150 words)
2. Mention the company name naturally
3. Show genuine interest in their company and what they do
4. Briefly highlight 2-3 relevant skills that match their industry
5. Ask if they have any open positions for Full Stack Developer
6. Professional but confident tone — not desperate
7. Sign off as "Sandeep Sahu" with "Full Stack Developer" below the name
8. Do NOT use placeholder text like [Your Name] or [Company]

Return ONLY a JSON object with these exact keys:
{
  "subject": "email subject line",
  "body": "full email body text",
  "summary": "one-line summary of what the email says"
}

Return valid JSON only. No markdown, no code blocks.`;
  } else {
    prompt = `You are a professional business development executive at a web development agency.

Generate a personalized cold email for the following business that does NOT have a website.

Business Details:
- Name: ${safeName}
- Category: ${safeCategory}
- Location: ${safeLocation}
- Phone: ${safePhone || "N/A"}
- Rating: ${safeRating} stars
- Reviews: ${safeTotalReviews}

Requirements:
1. Keep it short (under 150 words)
2. Mention their business name and category
3. Highlight why having a website would help THEIR specific type of business
4. Mention their good rating/reviews if available (social proof they should showcase online)
5. Include a clear call-to-action
6. Professional but friendly tone
7. Do NOT use placeholder text like [Your Name] — sign off as "The WebReach Team"

Return ONLY a JSON object with these exact keys:
{
  "subject": "email subject line",
  "body": "full email body text",
  "summary": "one-line summary of what the email says"
}

Return valid JSON only. No markdown, no code blocks.`;
  }

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Clean any markdown code block wrappers
      const cleaned = text.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();

      return JSON.parse(cleaned);
    } catch (err) {
      lastError = err;

      // Check for rate limit (429) — extract retry delay or use exponential backoff
      const is429 = err.message?.includes("429") || err.message?.includes("quota");
      if (is429 && attempt < MAX_RETRIES) {
        // Try to extract retry delay from error message
        const delayMatch = err.message.match(/retry in ([\d.]+)s/i);
        const waitSec = delayMatch ? Math.ceil(parseFloat(delayMatch[1])) + 2 : 20 * attempt;
        console.log(`    Rate limited — waiting ${waitSec}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
        await sleep(waitSec * 1000);
        continue;
      }

      // Non-429 error or last attempt — throw
      if (attempt === MAX_RETRIES) break;
    }
  }

  throw lastError || new Error("Gemini API failed after retries");
}

module.exports = { generateColdEmail };
