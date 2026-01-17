import { NextResponse } from "next/server";
import { z } from "zod";
import authServices from "@/services/authService";

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
    console.error("Signin API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 401 }
    );
  }
}
