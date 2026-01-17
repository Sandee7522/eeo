//  2️⃣ Increment JAP Count

import { authenticate } from "@/middleware/middleware";
import japServices from "@/services/japServices";
import { NextResponse } from "next/server";
import { z } from "zod";
const schema = z.object({
  japId: z.string(),
  count: z.number().int().positive().default(1),
});

export async function POST(req) {
  try {
    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    const contentType = req.headers.get("content-type");
    const params =
      contentType && contentType.includes("application/json")
        ? await req.json()
        : {};

    // const body = await req.json();
    const { japId, count } = schema.parse(params);

    const jap = await japServices.incrementCount(japId, auth.user.id, count);

    console.log(":::::::::::::JAP::::::::::::", jap);

    return NextResponse.json({
      success: true,
      message: "Count incremented",
      data: jap,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
