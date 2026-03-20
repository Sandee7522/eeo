import { SIGNIN, SIGNUP, LOGOUT, FORGOT_PASSWORD, RESET_PASSWORD } from "@/utils/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function getToken() {
  return sessionStorage.getItem("token");
}

function buildOptions(data, withAuth = false) {
  const headers = { "Content-Type": "application/json" };
  if (withAuth) {
    headers.Authorization = `Bearer ${getToken()}`;
  }
  return {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  };
}

// ─── Auth API functions ─────────────────────────────────────────────────────

/**
 * Sign in user
 * @param {{ email: string, password: string }} data
 */
export async function signinApi({ email, password }) {
  const res = await fetch(SIGNIN, buildOptions({ email, password }));
  const result = await res.json();

  if (result?.success) {
    // Save token and user to sessionStorage
    sessionStorage.setItem("token", result.data.token);
    sessionStorage.setItem("user", JSON.stringify(result.data.user));
    return result.data;
  }

  throw new Error(result?.message || "Login failed");
}

/**
 * Sign up user
 * @param {{ name: string, email: string, password: string, confirmPassword: string }} data
 */
export async function signupApi({ name, email, password, confirmPassword }) {
  const res = await fetch(SIGNUP, buildOptions({ name, email, password, confirmPassword }));
  const result = await res.json();

  if (result?.success) {
    return result.data;
  }

  throw new Error(result?.message || "Signup failed");
}

/**
 * Logout user (requires auth)
 */
export async function logoutApi() {
  const res = await fetch(LOGOUT, buildOptions({}, true));
  const result = await res.json();

  // Clear session regardless of server response
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  if (result?.success) {
    return result;
  }

  throw new Error(result?.message || "Logout failed");
}

/**
 * Forgot password — sends reset token
 * @param {{ email: string }} data
 */
export async function forgotPasswordApi({ email }) {
  const res = await fetch(FORGOT_PASSWORD, buildOptions({ email }));
  const result = await res.json();

  if (result?.success) {
    return result;
  }

  throw new Error(result?.message || "Request failed");
}

/**
 * Reset password with token
 * @param {{ email: string, resetToken: string, newPassword: string, confirmPassword: string }} data
 */
export async function resetPasswordApi({ email, resetToken, newPassword, confirmPassword }) {
  const res = await fetch(RESET_PASSWORD, buildOptions({ email, resetToken, newPassword, confirmPassword }));
  const result = await res.json();

  if (result?.success) {
    return result;
  }

  throw new Error(result?.message || "Reset failed");
}

/**
 * Check if user is logged in
 */
export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return !!sessionStorage.getItem("token");
}

/**
 * Get current user from session
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}
