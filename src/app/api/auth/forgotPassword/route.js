import { NextResponse } from "next/server";
import { z } from "zod";
import authServices from "@/services/authService";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const result = await authServices.forgotPassword(email);

    return NextResponse.json({
      success: true,
      message: result.message,
      ...(process.env.NODE_ENV === "development" && {
        resetToken: result.resetToken,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 404 }
    );
  }
}
