import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { status: 401, success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { getOutreachStats } = require("@/services/outreachService");
    const stats = await getOutreachStats();

    return NextResponse.json({
      status: 200,
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error("outreach/stats error:", err);
    return NextResponse.json(
      { status: 500, success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
