"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { signinApi } from "@/app/lib/authApi";
import AuthLayout, {
  AuthCard,
  AuthTitle,
  InputField,
  PasswordField,
  PrimarySubmitButton,
  ErrorAlert,
} from "@/components/auth/AuthLayout";

export default function SigninPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signinApi(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout pageKey="signin">
      <AuthCard>
        <AuthTitle title="Welcome back" subtitle="Sign in to your MapScrape account" />

        <ErrorAlert message={error} />

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

          <PasswordField
            label="Password"
            value={form.password}
            onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setError(null); }}
            showPassword={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-700 bg-transparent accent-cyan-500"
              />
              <span className="text-xs text-slate-500">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Forgot password?
            </Link>
          </div>

          <PrimarySubmitButton loading={loading} loadingText="Signing in...">
            Sign In
          </PrimarySubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300">
            Create account
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
