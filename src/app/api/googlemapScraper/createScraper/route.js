import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/utils/jwt";
import { scrapeGoogleMaps } from "@/services/googlemapScraper";

const createScraperSchema = z.object({
  query: z
    .string({ required_error: "query is required" })
    .min(2, "query must be at least 2 characters")
    .max(200, "query too long"),
  maxResults: z
    .number({ required_error: "maxResults is required" })
    .int()
    .min(1, "maxResults must be at least 1")
    .max(100, "maxResults cannot exceed 100")
    .default(20),
  scrapeWebsites: z.boolean().optional().default(false),
  onlyWithoutWebsite: z.boolean().optional().default(false),
  onlyWithEmail: z.boolean().optional().default(false),
});

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { status: 401, success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const parsed = createScraperSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 400, success: false, errors: parsed.error.flatten((i) => i.message).fieldErrors },
        { status: 400 }
      );
    }

    const { query, maxResults, scrapeWebsites, onlyWithoutWebsite, onlyWithEmail } = parsed.data;
    const result = await scrapeGoogleMaps(query, maxResults, { scrapeWebsites, onlyWithoutWebsite, onlyWithEmail });

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Scraping complete",
      data: {
        query,
        maxResults,
        saved: result.saved,
        failed: result.failed,
        duplicates: result.duplicates,
        total: result.total,
        exhausted: result.exhausted ?? false,
        foundCount: result.foundCount ?? result.total,
        durationSec: result.durationSec ?? null,
      },
    });
  } catch (err) {
    console.error("createScraper error:", err);
    return NextResponse.json(
      { status: 500, success: false, message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}
