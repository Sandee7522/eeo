// 8️⃣ History

import { authenticate } from "@/middleware/middleware";
import japServices from "@/services/japServices";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const japId = searchParams.get("japId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");

    if (!japId) {
      return NextResponse.json(
        { success: false, message: "Jap ID required" },
        { status: 400 }
      );
    }

    const history = await japServices.getJapHistory(japId, auth.user.id, {
      startDate,
      endDate,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Internal Server Error",
    },{status: 500});
  }
}
