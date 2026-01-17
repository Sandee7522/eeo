import { authenticate } from "@/middleware/middleware";
import { NextResponse } from "next/server";
import authServices from "@/services/authService";
import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2).max(100),
  headline: z.string().min(5).max(150),
  bio: z.string().max(500).optional().nullable(),
  photo: z.string().url().optional().nullable(),
  aboutJobs: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  socialLink: z.string().optional().nullable(),
  phone: z.string().min(8).max(15).optional().nullable(),
});

//#########################333333 CREATE PROFILE
export async function POST(req) {
  try {
    const auth = await authenticate(req); // must return userId
    console.log("auth:::::::::::::::::::::::::::", auth);

    if (!auth.authenticated) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error,
        },
        {
          status: auth.status,
        }
      );
    }

    // const body = await req.json();

    const contentType = req.headers.get("content-type");
    const params = contentType.includes("application/json")
      ? await req.json()
      : {};

    const validatedData = profileSchema.parse(params);

    const profile = await authServices.createProfile(
      auth.user.id,
      validatedData
    );

    // console.log("+++++++++++++++++profile++++++++++++++++++",profile);

    return NextResponse.json(
      { message: "Profile created successfully", profile },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

//############################################## UPDATE PROFILE
export async function PUT(req) {
  try {
    const auth = await authenticate(req);
    const body = await req.json();

    // Partial update allowed
    const validatedData = profileSchema.parse(body);

    const profile = await authServices.updateProfile(
      auth.user.id,
      validatedData
    );
    // console.log("++++++++++++++++++Profile+++++++++++++++++",profile);/

    return NextResponse.json(
      { message: "Profile updated successfully", profile },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
