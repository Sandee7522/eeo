"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, Key } from "lucide-react";
import { resetPasswordApi } from "@/app/lib/authApi";
import AuthLayout, {
  AuthCard,
  AuthTitle,
  InputField,
  PasswordField,
  PrimarySubmitButton,
  ErrorAlert,
  SuccessAlert,
  PasswordStrength,
} from "@/components/auth/AuthLayout";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    resetToken: searchParams.get("token") || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetPasswordApi(form);
      setSuccess(true);
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthTitle title="Reset password" subtitle="Choose a strong new password" />

      <ErrorAlert message={error} />
      {success && <SuccessAlert message="Password reset successful! Redirecting to sign in..." />}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            icon={Mail}
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <InputField
            icon={Key}
            label="Reset Token"
            type="text"
            name="resetToken"
            value={form.resetToken}
            onChange={handleChange}
            placeholder="Paste your reset token"
            required
          />

          <div>
            <PasswordField
              label="New Password"
              value={form.newPassword}
              onChange={(e) => handleChange({ target: { name: "newPassword", value: e.target.value } })}
              showPassword={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              placeholder="Min 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <PasswordStrength password={form.newPassword} />
          </div>

          <PasswordField
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => handleChange({ target: { name: "confirmPassword", value: e.target.value } })}
            showPassword={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            placeholder="Re-enter password"
            required
            autoComplete="new-password"
            error={
              form.confirmPassword && form.newPassword !== form.confirmPassword
                ? "Passwords do not match"
                : undefined
            }
          />

          <PrimarySubmitButton loading={loading} loadingText="Resetting...">
            Reset Password
          </PrimarySubmitButton>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-cyan-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout pageKey="reset-password">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <svg className="h-6 w-6 animate-spin text-cyan-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
