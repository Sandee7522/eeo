import { NextResponse } from "next/server";
import authServices from "@/services/authService";
import { authenticate } from "@/middleware/middleware";

export async function POST(req) {
  const auth = await authenticate(req);

  if (!auth.authenticated) {
    return NextResponse.json(
      {
        success: false,
        message: auth.error,
      },
      { status: auth.status }
    );
  }

  const result = await authServices.logout();

  return NextResponse.json({
    success: true,
    message: result.message,
  });
}
