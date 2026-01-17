// 7️⃣ Stats

import { authenticate } from "@/middleware/middleware";
import japServices from "@/services/japServices";
import { NextResponse } from "next/server";

export async function GET(req) {
  console.log("req:::::::::::::::::::::::", req);
  try {
    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    const stats = await japServices.getStats(auth.user.id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.log("::::::::Japs Stats Error::::::::", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
