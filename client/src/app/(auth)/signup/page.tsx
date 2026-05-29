"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";

interface SignupResponse {
  token: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateClient(): string | null {
    if (!name.trim()) return "Name is required";
    if (!EMAIL_REGEX.test(email.trim())) return "Enter a valid email address";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldError(null);

    const clientError = validateClient();
    if (clientError) {
      setFieldError(clientError);
      toast.error(clientError);
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post<SignupResponse>("/api/auth/signup", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      login(data.token);
      toast.success("Account created successfully");
      router.push("/apply");
    } catch {
      // Error toast handled by axios interceptor
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create borrower account"
      subtitle="Register to apply for a loan"
      footer={{
        text: "Already have an account?",
        linkText: "Sign in",
        href: "/login",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {fieldError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {fieldError}
          </p>
        )}

        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Jane Doe"
          />
        </div>

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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            placeholder="Repeat password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full !py-3"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </AuthCard>
  );
}
