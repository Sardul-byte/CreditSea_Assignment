"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";

interface LoginResponse {
  token: string;
  user: { role: string };
}

function getRedirectPath(role: string): string {
  return role === "borrower" ? "/apply" : "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldError(null);
    setLoading(true);

    try {
      const { data } = await api.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });

      login(data.token);
      toast.success("Signed in successfully");
      router.push(getRedirectPath(data.user.role));
    } catch (err) {
      setFieldError(getApiErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your Loan Management account"
      footer={{
        text: "Don't have an account?",
        linkText: "Sign up",
        href: "/signup",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {fieldError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {fieldError}
          </p>
        )}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full !py-3"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}
