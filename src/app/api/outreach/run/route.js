import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import { z } from "zod";

const runSchema = z.object({
  limit: z.number().int().min(1).max(50).optional().default(10),
  emailType: z.enum(["job_application", "website_offer"]).optional().default("job_application"),
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

    const body = await req.json().catch(() => ({}));
    const parsed = runSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 400, success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Dynamic import because it uses require() internally
    const { runOutreach } = require("@/services/outreachService");
    const result = await runOutreach({ limit: parsed.data.limit, emailType: parsed.data.emailType });

    return NextResponse.json({
      status: 200,
      success: true,
      message: `Outreach complete — Sent: ${result.sent}, Failed: ${result.failed}`,
      data: result,
    });
  } catch (err) {
    console.error("outreach/run error:", err);
    return NextResponse.json(
      { status: 500, success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
