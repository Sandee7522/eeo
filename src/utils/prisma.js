
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"] // show queries & errors in development
      : ["error"], // show only errors in production
});

export default prisma;
