import { NextResponse } from "next/server";
import { z } from "zod";
import authServices from "@/services/authService";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/[0-9]/, "Must contain number"),
    confirmPassword: z.string({
      required_error: "Confirm password is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });


export async function POST(req) {
  try {
    const body = await req.json();
    const validated = signupSchema.parse(body);

    const result = await authServices.signup(validated);

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup API Error:", error);

    // Zod validation error
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
        message: error.message || "Something went wrong",
      },
      { status: 400 }
    );
  }
}

