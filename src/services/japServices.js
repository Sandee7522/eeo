import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";

class JapService {
  // ############################## CreateJaps ###############################

  async createJaps(userId, data) {
    try {
      console.log("+++++++++++++JAPS+++++++++++++");
      const { name, description, goal } = data;

      console.log(
        "+++++++++++++JAPS++12+++++++++++",
        name,
        description,
        goal,
        userId
      );
      if (!userId) {
        throw new Error("Unauthorized");
      }

      const jap = await prisma.jap.create({
        data: {
          name,
          description,
          goal,
          userId,
          count: 0,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          goal: true,
          count: true,
          isActive: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      console.log("+++++++++++++JAPS+++++++++++++", jap);

      return jap;
    } catch (error) {
      console.error("Error creating jap:", error);
      throw new Error("Error creating jap");
    }
  }

  // ############################## GetJaps ###############################

  async getAllJaps(userId, filters = {}) {
    try {
      const { isActive, search } = filters;

      const where = {
        userId,

        ...(isActive === "true" && { isActive: true }),
        ...(isActive === "false" && { isActive: false }),

        ...(search?.trim() && {
          name: {
            contains: search.trim(),
            mode: "insensitive",
          },
        }),
      };

      const japs = await prisma.jap.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              history: true,
            },
          },
        },
      });

      console.log("+++++++++++++JAPS+++++++++++++", japs);
      return japs;
    } catch (error) {
      console.error("Error getting japs:", error);
      throw new Error("Error getting japs");
    }
  }

  // ############################## GetJap ###############################

  async getJapById(japId, userId) {
    console.log("::::::::::::::::::::::::::::::", japId, userId);
    try {
      // this function for get jap by id with help of findFirst this provide by the prisma
      const jap = await prisma.jap.findFirst({
        where: {
          id: japId,
          userId: userId,
        },
        include: {
          history: {
            orderBy: { date: "desc" },
            take: 50,
          },

          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!jap) {
        return NextResponse.json(
          {
            success: false,
            message: "jap not fornd",
          },
          {
            status: 401,
          }
        );
      }
      return jap;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "not found",
        },
        { status: 500 }
      );
    }
  }

  // ################################# update japs ############################
  async updateJap(japId, userId, data) {
    try {
      const jap = await prisma.jap.findFirst({
        where: {
          id: japId,
          userId,
        },
      });

      if (!jap) {
        throw new Error("Jap not found or access denied");
      }

      const updated = await prisma.jap.update({
        where: { id: japId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.goal !== undefined && { goal: data.goal }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: {
          _count: {
            select: {
              history: true,
            },
          },
        },
      });

      return updated;
    } catch (error) {
      console.log("::::::::Japs Upadate Error::::::::", error);
      throw new Error("Error updating jap");
    }
  }

  //   ############################# Delete japs ########################
  async deleteJap(japId, userId) {
    console.log(":::::::::::::::japId, userId:::::::::::::::", japId, userId);
    try {
      const jap = await prisma.jap.findFirst({
        where: {
          id: japId,
          userId,
        },
      });

      if (!jap) {
        throw new Error("Jap not found or access denied");
      }

      await prisma.jap.delete({
        where: { id: japId },
      });

      return { message: "Jap deleted successfully" };
    } catch (error) {
      console.log("::::::::Japs Delete Error::::::::", error);
      throw new Error("Error deleting jap");
    }
  }
  //   ####################################### increment japs ###################################

  async incrementCount(japId, userId, incrementBy = 1) {
    try {
      const jap = await prisma.jap.findFirst({
        where: {
          id: japId,
          userId,
          isActive: true,
        },
      });

      if (!jap) {
        throw new Error("Jap not found, inactive, or access denied");
      }

      const [updatedJap] = await prisma.$transaction([
        prisma.jap.update({
          where: { id: japId },
          data: {
            count: {
              increment: incrementBy,
            },
          },
        }),
        prisma.japHistory.create({
          data: {
            japId,
            count: incrementBy,
          },
        }),
      ]);

      const japWithHistory = await prisma.jap.findUnique({
        where: { id: japId },
        include: {
          history: {
            orderBy: { date: "desc" },
            take: 10,
          },
        },
      });

      return japWithHistory;
    } catch (error) {
      console.log("::::::::Japs Increment Error::::::::", error);
      throw new Error("Error incrementing jap");
    }
  }

  //   ################## get jap history ###################################
  async getJapHistory(japId, userId, filters = {}) {
    console.log(
      "::::::::japId, userId, filters:::::::::::",
      japId,
      userId,
      filters
    );

    try {
      const jap = await prisma.jap.findFirst({
        where: {
          id: japId,
          userId,
        },
      });

      if (!jap) {
        throw new Error("Jap not found or access denied");
      }

      const { startDate, endDate, limit = 100 } = filters;

      const where = {
        japId,
        ...(startDate &&
          endDate && {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      };

      const history = await prisma.japHistory.findMany({
        where,
        orderBy: { date: "desc" },
        take: parseInt(limit),
      });

      const total = await prisma.japHistory.aggregate({
        where,
        _sum: {
          count: true,
        },
      });

      return {
        history,
        totalCount: total._sum.count || 0,
      };
    } catch (error) {
      console.log("::::::::Japs History Error::::::::", error);
      throw new Error("Error getting jap history");
    }
  }
  // ###########################3 get stats #############################
  async getStats(userId) {
    console.log(":::::::::::::::userId:::::::::::::::", userId);

    try {
      const totalJaps = await prisma.jap.count({
        where: { userId },
      });

      const activeJaps = await prisma.jap.count({
        where: { userId, isActive: true },
      });

      const totalCount = await prisma.jap.aggregate({
        where: { userId },
        _sum: {
          count: true,
        },
      });

      const japsWithGoals = await prisma.jap.findMany({
        where: {
          userId,
          isActive: true,
          goal: {
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          count: true,
          goal: true,
        },
      });

      const goalsProgress = japsWithGoals.map((jap) => ({
        id: jap.id,
        name: jap.name,
        current: jap.count,
        goal: jap.goal,
        percentage: jap.goal
          ? Math.min((jap.count / jap.goal) * 100, 100).toFixed(2)
          : 0,
      }));

      const recentActivity = await prisma.japHistory.findMany({
        where: {
          jap: {
            userId,
          },
        },
        orderBy: { date: "desc" },
        take: 20,
        include: {
          jap: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        totalJaps,
        activeJaps,
        totalCount: totalCount._sum.count || 0,
        goalsProgress,
        recentActivity,
      };
    } catch (error) {
      console.log("::::::::Japs Stats Error::::::::", error);
      throw new Error("Error getting jap stats");
    }
  }
  // ##############################################################################################
}
export default new JapService();
