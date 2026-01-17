import { authenticate } from "@/middleware/middleware";
import japServices from "@/services/japServices";
import { NextResponse } from "next/server";



// http://localhost:3000/api/japs/japdetail?japId=024272bb-fe1b-464e-b9fb-8d1464b12074
export async function GET(req) {
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

    if (!japId) {
      return NextResponse.json(
        { success: false, message: "Jap ID required" },
        { status: 400 }
      );
    }

    const jap = await japServices.getJapById(japId, auth.user.id);


    console.log('+++++++++++++JAPS+++++++++++++',jap);

    return NextResponse.json({ success: true, data: jap });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Jap fetching failed " || error.message },
      { status: 400 }
    );
  }
}
