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
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    const japs = await japServices.getAllJaps(auth.user.id, {
      isActive,
      search,
    });

    return NextResponse.json({
      success: true,
      data: japs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
