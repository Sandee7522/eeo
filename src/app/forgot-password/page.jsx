"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { forgotPasswordApi } from "@/app/lib/authApi";
import AuthLayout, {
  AuthCard,
  AuthTitle,
  InputField,
  PrimarySubmitButton,
  ErrorAlert,
  SuccessAlert,
} from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await forgotPasswordApi({ email });
      setSuccess(true);
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout pageKey="forgot-password">
      <AuthCard>
        <AuthTitle
          title="Forgot password"
          subtitle="Enter your email and we'll send you a reset link"
        />

        <ErrorAlert message={error} />

        {success && (
          <>
            <SuccessAlert message="Password reset instructions sent to your email." />
            {resetToken && (
              <div
                className="mb-5 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(6,182,212,0.06)",
                  border: "1px solid rgba(6,182,212,0.12)",
                }}
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Dev mode — Reset Token
                </p>
                <code className="mt-1.5 block break-all rounded-lg px-3 py-2 text-xs text-cyan-300" style={{ background: "rgba(0,0,0,0.3)" }}>
                  {resetToken}
                </code>
                <Link
                  href={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Go to Reset Password →
                </Link>
              </div>
            )}
          </>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              icon={Mail}
              label="Email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <PrimarySubmitButton loading={loading} loadingText="Sending...">
              Send Reset Link
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
    </AuthLayout>
  );
}
