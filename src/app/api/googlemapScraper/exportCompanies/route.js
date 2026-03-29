import ScrapServices from "@/services/scrapeService";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import { z } from "zod";

const exportSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  onlyIds: z.boolean().optional(),
  search: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  hasWebsite: z.enum(["yes", "no"]).optional(),
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

    const parsed = exportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 400, success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { ids, onlyIds, ...filters } = parsed.data;

    if (onlyIds) {
      const allIds = await ScrapServices.getAllCompanyIds(filters);
      return NextResponse.json({
        status: 200,
        success: true,
        data: allIds,
        total: allIds.length,
      });
    }

    const companies = await ScrapServices.exportCompanies({ ids, filters });
    return NextResponse.json({
      status: 200,
      success: true,
      data: companies,
      total: companies.length,
    });
  } catch (err) {
    return NextResponse.json(
      { status: 500, success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
