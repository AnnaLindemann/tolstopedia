"use client";

import { useState } from "react";

export default function AdminLogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Admin logout failed:", error);
      alert("Не удалось выйти из админки.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Выход..." : "Выйти"}
    </button>
  );
}