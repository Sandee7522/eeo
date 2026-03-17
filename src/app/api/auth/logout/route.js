import { NextResponse } from "next/server";
import authServices from "@/services/authService";
import { authenticate } from "@/middleware/middleware";

export async function POST(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error || "Unauthorized",
        },
        { status: auth.status || 401 },
      );
    }

    const result = await authServices.logout();

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Logout failed",
      },
      { status: 500 },
    );
  }
}
