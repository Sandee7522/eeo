import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class ScrapServices {
  // 🔍 Get Companies (Filter + Search + Pagination)
  static async getCompanies(filters = {}) {
    try {
      const {
        city,
        state,
        country,
        category,
        industry,
        search,
        minRating,
        page = 1,
        limit = 10,
      } = filters;

      const where = {
        ...(city && { city: { contains: city, mode: "insensitive" } }),
        ...(state && { state: { contains: state, mode: "insensitive" } }),
        ...(country && { country: { contains: country, mode: "insensitive" } }),
        ...(category && {
          category: { contains: category, mode: "insensitive" },
        }),
        ...(industry && {
          industry: { contains: industry, mode: "insensitive" },
        }),
        ...(minRating !== undefined && { rating: { gte: minRating } }),

        // 🔎 Global search
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            { website: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.company.count({ where }),
      ]);

      return {
        data: companies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Get Companies Error:", error);
      throw new Error("FAILED_TO_FETCH_COMPANIES");
    }
  }

  // Get Scrape History (Filter + Search + Pagination)
  static async getHistory(filters = {}) {
    try {
      const {
        query,
        search,
        queryType,
        source,
        status,
        country,
        state,
        city,
        savedToTable,
        minSaved,
        minFailed,
        minDuplicates,
        minTotal,
        maxResults,
        from,
        to,
        page = 1,
        limit = 5,
      } = filters;

      const where = {
        ...(query && { query: { contains: query } }),
        ...(queryType && { queryType }),
        ...(source && { source }),
        ...(status && { status }),
        ...(country && { country: { contains: country } }),
        ...(state && { state: { contains: state } }),
        ...(city && { city: { contains: city } }),
        ...(savedToTable && { savedToTable }),
        ...(minSaved !== undefined && { saved: { gte: minSaved } }),
        ...(minFailed !== undefined && { failed: { gte: minFailed } }),
        ...(minDuplicates !== undefined && { duplicates: { gte: minDuplicates } }),
        ...(minTotal !== undefined && { total: { gte: minTotal } }),
        ...(maxResults !== undefined && { maxResults: { equals: maxResults } }),
        ...(from || to
          ? {
              createdAt: {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) }),
              },
            }
          : {}),
        // Global search across query, source, status, city, country
        ...(search && {
          OR: [
            { query: { contains: search } },
            { source: { contains: search } },
            { status: { contains: search } },
            { city: { contains: search } },
            { country: { contains: search } },
          ],
        }),
      };

      const [history, total] = await Promise.all([
        prisma.scrapeHistory.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.scrapeHistory.count({ where }),
      ]);

      return {
        data: history,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Get History Error:", error);
      throw new Error("FAILED_TO_FETCH_HISTORY");
    }
  }

  // Get all company IDs (for select all)
  static async getAllCompanyIds(filters = {}) {
    try {
      const { city, state, country, category, search, minRating } = filters;
      const where = {
        ...(city && { city: { contains: city } }),
        ...(state && { state: { contains: state } }),
        ...(country && { country: { contains: country } }),
        ...(category && { category: { contains: category } }),
        ...(minRating !== undefined && { rating: { gte: minRating } }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { address: { contains: search } },
            { city: { contains: search } },
            { website: { contains: search } },
          ],
        }),
      };

      const companies = await prisma.company.findMany({
        where,
        select: { id: true },
      });

      return companies.map((c) => c.id);
    } catch (error) {
      console.error("Get All IDs Error:", error);
      throw new Error("FAILED_TO_FETCH_IDS");
    }
  }

  // Export companies (all or by IDs)
  static async exportCompanies({ ids, filters = {} } = {}) {
    try {
      const where = {};

      if (ids && ids.length > 0) {
        where.id = { in: ids };
      } else {
        const { city, state, country, category, search, minRating } = filters;
        if (city) where.city = { contains: city };
        if (state) where.state = { contains: state };
        if (country) where.country = { contains: country };
        if (category) where.category = { contains: category };
        if (minRating !== undefined) where.rating = { gte: minRating };
        if (search) {
          where.OR = [
            { name: { contains: search } },
            { address: { contains: search } },
            { city: { contains: search } },
            { website: { contains: search } },
          ];
        }
      }

      const companies = await prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return companies;
    } catch (error) {
      console.error("Export Companies Error:", error);
      throw new Error("FAILED_TO_EXPORT_COMPANIES");
    }
  }

  // 🔴 Delete Company
  static async deleteCompanyById(id) {
    try {
      const existing = await prisma.company.findUnique({ where: { id } });

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      await prisma.company.delete({ where: { id } });

      return existing;
    } catch (error) {
      console.error("Delete Company Error:", error);

      if (error.message === "NOT_FOUND") {
        throw error;
      }

      throw new Error("FAILED_TO_DELETE_COMPANY");
    }
  }
}
