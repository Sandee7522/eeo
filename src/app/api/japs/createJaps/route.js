import { authenticate } from "@/middleware/middleware";
import japServices from "@/services/japServices";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  goal: z.number().int().positive().optional(),
});

export async function POST(req) {
  try {
    const auth = await authenticate(req);

    console.log("auth:::::::::::::::::::::::", auth);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    // const body = await req.json();
    const contentType = req.headers.get("content-type");
    const params =
      contentType && contentType.includes("application/json")
        ? await req.json()
        : {};

    console.log("body:::::::::::::::::::::::", params);
    const validated = schema.parse(params);

    const jap = await japServices.createJaps(auth.user.id, validated);

    console.log("+++++++++++++JAPS+++++++++++++", jap);

    return NextResponse.json(
      {
        success: true,
        message: "Jap created successfully",
        data: jap,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
