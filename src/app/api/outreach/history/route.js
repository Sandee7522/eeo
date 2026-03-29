import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import { z } from "zod";

const historySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["sent", "failed", "pending"]).optional(),
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

    const body = await req.json().catch(() => ({}));
    const parsed = historySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 400, success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { getOutreachHistory } = require("@/services/outreachService");
    const result = await getOutreachHistory({
      page: parsed.data.page,
      limit: parsed.data.pageSize,
      status: parsed.data.status,
    });

    return NextResponse.json({
      status: 200,
      success: true,
      data: result.data,
      meta: {
        page: result.pagination.page,
        pageSize: result.pagination.limit,
        totalCount: result.pagination.total,
        totalPages: result.pagination.totalPages,
      },
    });
  } catch (err) {
    console.error("outreach/history error:", err);
    return NextResponse.json(
      { status: 500, success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
