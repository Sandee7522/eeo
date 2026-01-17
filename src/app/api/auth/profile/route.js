import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/middleware';
import authServices from '@/services/authService';

export async function GET(req) {
  try {
    // ✅ Authenticate user
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error,
        },
        { status: auth.status }
      );
    }

    // ✅ Get user profile
    const profile = await authServices.getProfile(auth.user.id);

    return NextResponse.json({
      success: true,
      data: profile,
    });

  } catch (error) {
    console.error("GET Profile API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}
