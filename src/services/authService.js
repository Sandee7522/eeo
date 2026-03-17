import bcrypt from "bcryptjs";
import { generateToken, generateResetToken, verifyToken } from "@/utils/jwt";
import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";

class AuthService {
  // ##################### signup #####################
  async signup(data) {
    try {
      const { name, email, password } = data;

      // 🔹 Check existing user
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // 🔹 Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // 🔹 Create user (ONLY schema fields)
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 🔹 Generate token
      const token = generateToken({ userId: user.id });

      return { user, token };
    } catch (error) {
      console.error("Signup Service Error:", error);
      throw new Error(error.message || "Signup failed");
    }
  }

  //   ##################### signin #####################
  async signin(data) {
    try {
      const { email, password } = data;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      const token = generateToken({ userId: user.id });

      const { password: _, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token };
    } catch (error) {
      console.error("Signin Service Error:", error);
      throw new Error(error.message || "Signin failed");
    }
  }

  // ##################### forgotPassword #####################
  async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message: "If the email exists, a reset link has been sent",
      };
    }

    const resetToken = generateResetToken(user.id);

    // 👉 Normally email bhejte hain yahan

    return {
      message: "Password reset token generated",
      resetToken,
      email: user.email,
    };
  }

  // ##################### resetPassword #####################

  async resetPassword(data) {
    const { email, resetToken, newPassword } = data;

    const decoded = verifyToken(resetToken);

    if (!decoded || decoded.type !== "reset") {
      throw new Error("Invalid reset token");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (decoded.userId !== user.id) {
      throw new Error("Reset token not valid for this user");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return { message: "Password has been reset successfully" };
  }
  // ##################### logout #####################
  async logout() {
    return { message: "Logged out successfully" };
  }
}

export default new AuthService();
