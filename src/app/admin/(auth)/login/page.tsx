"use client";

import { useState } from "react";

type LoginResponse =
  | { ok: true }
  | { ok: false; error: string };

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        setError("Server returned an invalid response.");
        return;
      }

      const data = (await res.json()) as LoginResponse;

      if (!data.ok) {
        setError(data.error);
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Login request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md"
      >
        <h1 className="mb-4 text-2xl font-semibold text-neutral-800">
          Admin Login
        </h1>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none transition focus:border-neutral-500"
        />

        {error ? (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-black px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}