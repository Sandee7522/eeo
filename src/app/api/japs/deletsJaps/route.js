// 6️⃣ Delete JAP

import { authenticate } from "@/middleware/middleware";
import { NextResponse } from "next/server";


export async function DELETE(req) {
  try {
    const auth = await authenticate(req);

    console.log("auth:::::::::::::::::::::::", auth);

    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const japId = searchParams.get("japId");

    console.log("japId:::::::::::::::::::::::", japId);

    if (!japId) {
      return NextResponse.json(
        { success: false, message: "Jap ID required" },
        { status: 400 }
      );
    }

    const result = await japService.deleteJap(japId, auth.user.id);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.log("error:::::::::::::::::::::", error);
    return NextResponse.json(
      { success: false, message: "Intertnal server error" },
      { status: 500 }
    );
  }
}
