// Update JAP

// http://localhost:3001/api/japs/updateJaps
// {
//   "japId": "896aa153-4903-471b-9f50-b43c75ef8f0b",
//   "name": "Seeta-Ram",
//   "description": "Seeta-Ram jai Seeta Ram",
//   "goal": 200
// }

import { authenticate } from "@/middleware/middleware";
import japServices from "@/services/japServices";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  japId: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  goal: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req) {
  try {
    console.log("req:::::::::::::::::::::::", req);
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
    const payload =
      contentType && contentType.includes("application/json")
        ? await req.json()
        : {};


    const { japId, ...data } = schema.parse(payload);

    console.log("data:::::::::::::::::::::::", data);

    const updatedJap = await japServices.updateJap(japId, auth.user.id, data);

    console.log("::::::::::::UPDATED JAP::::::::::::", updatedJap);
    return NextResponse.json({
      success: true,
      message: "Jap updated",
      data: updatedJap,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
