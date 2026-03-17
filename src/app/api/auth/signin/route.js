import { NextResponse } from "next/server";
import { z } from "zod";
import authServices from "@/services/authService";

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = signinSchema.parse(body);

    const data = await authServices.signin(validated);

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    // 🔥 Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.errors[0].message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Login failed",
      },
      { status: 401 },
    );
  }
}
