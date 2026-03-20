import ScrapServices from "@/services/scrapeService";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import { z } from "zod";

const getScrapedDataSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(5),
  search: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
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

    const parsed = getScrapedDataSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 400, success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { page, pageSize, ...filters } = parsed.data;
    const result = await ScrapServices.getCompanies({ ...filters, page, limit: pageSize });

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
    return NextResponse.json(
      { status: 500, success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
