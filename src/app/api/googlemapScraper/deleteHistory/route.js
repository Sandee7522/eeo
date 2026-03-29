import ScrapServices from "@/services/scrapeService";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import { z } from "zod";

const schema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
});

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { status: 401, success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 400, success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const deleted = await ScrapServices.deleteHistoryById(parsed.data.id);

    return NextResponse.json({
      status: 200,
      success: true,
      message: deleted?.query 
        ? `History "${deleted.query}" deleted successfully`
        : "History deleted successfully",
    });
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return NextResponse.json(
        { status: 404, success: false, message: "History not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { status: 500, success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
