// Google Maps Scraper using Puppeteer + Prisma
// Usage: node src/services/googlemapScraper.js "restaurants in Mumbai" 20

const puppeteer = require("puppeteer");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Extract lat/lng — prefers !3d<lat>!4d<lng> (most reliable in place URLs)
function extractLatLng(url) {
  const d3d4 = url.match(/!3d([-\d.]+)!4d([-\d.]+)/);
  if (d3d4) {
    return { latitude: parseFloat(d3d4[1]), longitude: parseFloat(d3d4[2]) };
  }
  // fallback: @lat,lng
  const atMatch = url.match(/@([-\d.]+),([-\d.]+)/);
  if (atMatch) {
    return { latitude: parseFloat(atMatch[1]), longitude: parseFloat(atMatch[2]) };
  }
  return { latitude: null, longitude: null };
}

// Build unique key from lat/lng (5 decimal places ≈ 1 m precision)
// Falls back to name slug so records are never silently skipped
function buildLocationKey(latitude, longitude, name) {
  if (latitude != null && longitude != null) {
    return `${latitude.toFixed(5)}_${longitude.toFixed(5)}`;
  }
  if (name) {
    return `name_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 60)}`;
  }
  return null;
}

// Parse city/state/country from address string
function parseAddress(address) {
  if (!address) return { city: null, state: null, country: null };
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const country = parts.length > 0 ? parts[parts.length - 1] : null;
  const state   = parts.length > 1 ? parts[parts.length - 2] : null;
  const city    = parts.length > 2 ? parts[parts.length - 3] : null;
  return { city, state, country };
}

async function scrapeGoogleMaps(
  SEARCH_QUERY = "restaurants in Mumbai",
  MAX_RESULTS = 100,
) {
  const startedAt = new Date();
  console.log(`🔍 Searching Google Maps for: "${SEARCH_QUERY}"`);
  console.log(`📦 Target results: ${MAX_RESULTS}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );
  await page.setViewport({ width: 1280, height: 800 });

  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(SEARCH_QUERY)}`;
  console.log(`🌐 Navigating to: ${searchUrl}`);
  await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

  await page.waitForSelector('[role="feed"]', { timeout: 15000 }).catch(() => {
    console.log("⚠️  Could not find results feed, trying alternative selector");
  });

  console.log("📜 Scrolling to load more results...");
  const resultsPanel = await page.$('[role="feed"]');
  let scrollExhausted = false;
  if (resultsPanel) {
    let previousCount = 0;
    for (let i = 0; i < 10; i++) {
      await page.evaluate((el) => { el.scrollTop = el.scrollHeight; }, resultsPanel);
      await new Promise((r) => setTimeout(r, 1500));
      const currentCount = await page.$$eval('a[href*="/maps/place/"]', (els) => els.length);
      if (currentCount >= MAX_RESULTS) break;
      if (currentCount === previousCount) {
        // No new results loaded — Google Maps hit the end
        scrollExhausted = true;
        break;
      }
      previousCount = currentCount;
    }
    // Also check for Google Maps end-of-list text
    const endOfListFound = await page.evaluate(() => {
      const feed = document.querySelector('[role="feed"]');
      if (!feed) return false;
      const text = feed.innerText || "";
      return (
        text.includes("You've reached the end of the list") ||
        text.includes("reached the end") ||
        !!feed.querySelector('[class*="HlvSq"]') // GM end-marker class
      );
    }).catch(() => false);
    if (endOfListFound) scrollExhausted = true;
  }

  const placeLinks = await page.$$eval('a[href*="/maps/place/"]', (links) =>
    links.map((a) => a.href).filter((h, i, arr) => arr.indexOf(h) === i),
  );

  // Exhausted if Google Maps returned fewer results than requested
  const exhausted = scrollExhausted || placeLinks.length < MAX_RESULTS;

  console.log(`✅ Found ${placeLinks.length} place links${exhausted ? " (all results exhausted)" : ""}`);
  const toProcess = placeLinks.slice(0, MAX_RESULTS);

  let saved = 0;
  let failed = 0;
  let duplicates = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const placeUrl = toProcess[i];
    console.log(`\n[${i + 1}/${toProcess.length}] Scraping: ${placeUrl}`);

    try {
      await page.goto(placeUrl, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 1500));

      const data = await page.evaluate(() => {
        const getText = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.textContent.trim() : null;
        };

        const name =
          getText('h1[class*="fontHeadlineLarge"]') ||
          getText("h1") ||
          getText('[data-item-id="title"] span');

        const category =
          getText('button[jsaction*="category"]') ||
          getText('[class*="fontBodyMedium"] button') ||
          null;

        const address =
          getText('[data-item-id="address"]') ||
          getText('button[data-item-id="address"]') ||
          getText('[class*="address"]') ||
          null;

        const phoneEl = document.querySelector('[data-tooltip="Copy phone number"]');
        const phone = phoneEl
          ? phoneEl.closest("button")?.textContent?.trim() || null
          : getText('[data-item-id*="phone"]');

        const websiteEl = document.querySelector('a[data-item-id="authority"]');
        const website = websiteEl ? websiteEl.href : null;

        const ratingText = getText('[class*="fontDisplayLarge"]');
        const rating = ratingText ? parseFloat(ratingText) : null;

        const reviewsText = getText('[class*="fontBodySmall"] span[aria-label]') || "";
        const reviewsMatch = reviewsText.match(/([\d,]+)\s*review/i);
        const totalReviews = reviewsMatch
          ? parseInt(reviewsMatch[1].replace(/,/g, ""), 10)
          : null;

        const priceLevelText = getText('[aria-label*="Price"]') || "";
        const priceLevel = priceLevelText.match(/\$/g)?.length || null;

        const statusEl = document.querySelector('[class*="open-now"]');
        const status = statusEl
          ? statusEl.textContent.includes("Closed") ? "CLOSED" : "OPERATIONAL"
          : null;

        const hoursRows = Array.from(document.querySelectorAll('tr[class*="WgFkxc"]'))
          .map((row) => {
            const day   = row.querySelector("td:first-child")?.textContent?.trim();
            const hours = row.querySelector("td:last-child")?.textContent?.trim();
            return day && hours ? { day, hours } : null;
          })
          .filter(Boolean);

        const mailtoEl = document.querySelector('a[href^="mailto:"]');
        let email = mailtoEl
          ? mailtoEl.href.replace("mailto:", "").split("?")[0].trim()
          : null;
        if (!email) {
          const emailMatch = (document.body.innerText || "").match(
            /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,
          );
          if (emailMatch) email = emailMatch[0];
        }

        return {
          name, category, address, phone, website, email,
          rating, totalReviews, priceLevel, status,
          openingHours: hoursRows.length ? hoursRows : null,
        };
      });

      // Visit website to find email if still missing
      if (!data.email && data.website) {
        try {
          await page.goto(data.website, { waitUntil: "domcontentloaded", timeout: 12000 });
          data.email = await page.evaluate(() => {
            const el = document.querySelector('a[href^="mailto:"]');
            if (el) return el.href.replace("mailto:", "").split("?")[0].trim();
            const m = (document.body.innerText || "").match(
              /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,
            );
            return m ? m[0] : null;
          });
        } catch {
          // website visit failed — keep null
        }
      }

      const currentUrl = page.url();
      const { latitude, longitude } = extractLatLng(currentUrl);
      const locationKey = buildLocationKey(latitude, longitude, data.name);
      const { city, state, country } = parseAddress(data.address);

      if (!data.name) {
        console.warn(`  ⚠️  Could not extract name, skipping`);
        failed++;
        continue;
      }

      if (!locationKey) {
        console.warn(`  ⚠️  Could not build locationKey, skipping`);
        failed++;
        continue;
      }

      // Check if already exists in DB
      const existing = await prisma.company.findUnique({
        where: { locationKey },
      });

      if (existing) {
        // Duplicate — don't overwrite existing data
        duplicates++;
        console.log(
          `  ⏭️  Duplicate: "${data.name}" already in DB, skipping`,
        );
      } else {
        await prisma.company.create({
          data: {
            locationKey,
            name: data.name,
            category: data.category ?? null,
            address: data.address || "",
            city, state, country,
            latitude, longitude,
            phone: data.phone ?? null,
            website: data.website ?? null,
            email: data.email ?? null,
            rating: data.rating ?? null,
            totalReviews: data.totalReviews ?? null,
            priceLevel: data.priceLevel ?? null,
            status: data.status ?? null,
            openingHours: data.openingHours ?? null,
          },
        });

        saved++;
        console.log(
          `  ✅ Saved: "${data.name}" | 📍 ${latitude ?? "?"}, ${longitude ?? "?"} | ⭐ ${data.rating ?? "N/A"}`,
        );
      }
    } catch (err) {
      failed++;
      console.error(`  ❌ Error scraping ${placeUrl}: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
  }

  await browser.close();

  console.log(`\n🎯 Done! Saved: ${saved} | Duplicates: ${duplicates} | Failed: ${failed}${exhausted ? " | ⚠️  Results exhausted" : ""}`);

  const endedAt = new Date();
  const durationSec = Math.round((endedAt - startedAt) / 1000);

  // Save scrape history
  try {
    await prisma.scrapeHistory.create({
      data: {
        query: SEARCH_QUERY,
        queryType: "search",
        source: "google_maps",
        maxResults: MAX_RESULTS,
        total: toProcess.length,
        saved,
        failed,
        duplicates,
        status: failed === toProcess.length ? "failed" : "completed",
        savedToTable: "Company",
        durationSec,
        startedAt,
        endedAt,
      },
    });
    console.log(`📝 Scrape history saved (${durationSec}s)`);
  } catch (err) {
    console.error(`⚠️  Failed to save scrape history: ${err.message}`);
  }

  return { saved, failed, duplicates, total: toProcess.length, exhausted, foundCount: placeLinks.length, durationSec };
}

module.exports = { scrapeGoogleMaps };

// CLI usage: node src/services/googlemapScraper.js "query" 20
if (require.main === module) {
  const query = process.argv[2] || "restaurants in Mumbai";
  const max = parseInt(process.argv[3]) || 100;

  (async () => {
    try {
      await scrapeGoogleMaps(query, max);
    } catch (err) {
      console.error("❌ Scraper crashed:", err);
    } finally {
      await prisma.$disconnect();
      console.log("🔌 Prisma disconnected");
    }
  })();
}
