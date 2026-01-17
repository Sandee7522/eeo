import bcrypt from "bcryptjs";
import { generateToken, generateResetToken, verifyToken } from "@/utils/jwt";
import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";

class AuthService {
  // ##################### signup #####################
  async signup(data) {
    try {
      const { name, email, password } = data;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          provider: "EMAIL",
          role: "USERS",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
        },
      });

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

      if (!user.password) {
        throw new Error("Please use social login for this account");
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
        resetToken: null,
      };
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password reset not available for social login accounts",
        },
        {
          status: 404,
        }
      );
    }

    const resetToken = generateResetToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: `RESET:${resetToken}:${user.password}`,
      },
    });

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
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reset token",
        },
        {
          status: 404,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    if (!user.password || !user.password.startsWith("RESET:")) {
      return NextResponse.json(
        {
          success: false,
          message: "Password reset not available for social login accounts",
        },
        {
          status: 404,
        }
      );
    }

    const [, storedToken] = user.password.split(":");

    if (storedToken !== resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reset token",
        },
        {
          status: 404,
        }
      );
    }

    if (decoded.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset token is not valid for this user",
        },
        {
          status: 404,
        }
      );
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

  /* **************************************************************
              for user profile
 ***************************************************************** */

  // ##################### Create Profile #####################

  async createProfile(userId, data) {
    try {
      // Important check
      if (!userId) {
        throw new Error("Unauthorized");
      }

      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        throw new Error("Profile already exists");
      }

      const profile = await prisma.userProfile.create({
        data: {
          fullName: data.fullName,
          headline: data.headline,
          bio: data.bio,
          photo: data.photo,
          phone: data.phone,
          aboutJobs: data.aboutJobs,
          address: data.address,
          socialLink: data.socialLink,
          userId: userId,
        },
      });

      return profile;
    } catch (error) {
      console.error("Create Profile Error:", error);

      // Re-throw for route/controller layer
      throw new Error(error.message || "Failed to create profile");
    }
  }

  // ##################### Update Profile #####################

  async updateProfile(userId, date) {
    // console.log('::::::::::_userid data_::::::::::',userId, date);
    try {
      if (!userId) {
        throw new Error("Unauthorized");
      }

      const existingProifile = await prisma.userProfile.findUnique({
        where: { userId },
      });

      if (!existingProifile) {
        throw new Error("Profile not found");
      }

      const updatedProfile = await prisma.userProfile.update({
        where: { userId },
        data: {
          fullName: date.fullName,
          headline: date.headline,
          bio: date.bio,
          photo: date.photo,
          phone: date.phone,
          aboutJobs: date.aboutJobs,
          address: date.address,
          socialLink: date.socialLink,
        },
      });

      console.log(":::::::::::::::updatedProfile:::::::::::::", updatedProfile);
      return updatedProfile;
    } catch (error) {}
  }

  // ##################### getProfile #####################

  async getProfile(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Optional: type check (useful if ID comes from params/JWT)
      if (typeof userId !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid user ID",
          },
          {
            status: 404,
          }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          provider: true,
          createdAt: true,
          updatedAt: true,

          userProfile: {
            select: {
              fullName: true,
              headline: true,
              bioto: true,
              pho: true,
              phone: true,
              aboutJobs: true,
              address: true,
              socialLink: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          _count: {
            select: {
              japs: true,
            },
          },
        },
      });

      //  Important check: user existence
      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      // Centralized error handling
      console.error("Get Profile Error:", error);

      // Re-throw for controller / API layer
      throw new Error(error.message || "Failed to fetch user profile");
    }
  }

  // ##################### logout #####################
  async logout() {
    return { message: "Logged out successfully" };
  }
}

export default new AuthService();
