"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail } from "lucide-react";
import { signupApi } from "@/app/lib/authApi";
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

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signupApi(form);
      setSuccess(true);
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout pageKey="signup">
      <AuthCard>
        <AuthTitle title="Create account" subtitle="Get started with MapScrape for free" />

        <ErrorAlert message={error} />
        {success && <SuccessAlert message="Account created! Redirecting to sign in..." />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            icon={User}
            label="Full Name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            minLength={2}
            autoComplete="name"
          />

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

          <div>
            <PasswordField
              label="Password"
              value={form.password}
              onChange={(e) => handleChange({ target: { name: "password", value: e.target.value } })}
              showPassword={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              placeholder="Min 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <PasswordStrength password={form.password} />
          </div>

          <div>
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
                form.confirmPassword && form.password !== form.confirmPassword
                  ? "Passwords do not match"
                  : undefined
              }
            />
          </div>

          <PrimarySubmitButton loading={loading || success} loadingText={success ? "Redirecting..." : "Creating account..."}>
            Sign Up
          </PrimarySubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300">
            Sign In
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
