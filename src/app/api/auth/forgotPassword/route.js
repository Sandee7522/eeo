import { NextResponse } from "next/server";
import { z } from "zod";
import authServices from "@/services/authService";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
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

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.errors[0].message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Request failed",
      },
      { status: 404 }
    );
  }
}