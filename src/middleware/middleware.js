import { verifyToken } from "@/utils/jwt";
import prisma from "@/utils/prisma";

export const authenticate = async (req) => {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authenticated: false, error: "No token provided" };
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    console.log(token);
    console.log(decoded);

    if (!decoded || !decoded.userId) {
      return { authenticated: false, error: "Invalid token" };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { authenticated: false, error: "User not found" };
    }

    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: "Authentication failed" };
  }
};
