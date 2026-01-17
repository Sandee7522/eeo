import { NextResponse } from "next/server";
import { z } from "zod";
import authServices from "@/services/authService";

const schema = z
  .object({
    email: z.string().email(),
    resetToken: z.string(),
    newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = schema.parse(body);

    const result = await authServices.resetPassword(validated);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 }
    );
  }
}
