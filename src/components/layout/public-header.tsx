"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavigationItem = {
  href: string;
  label: string;
};

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Главная" },
  { href: "/gallery", label: "Галерея" },
  { href: "/videos", label: "Видео" },
  { href: "/biography", label: "Биография" },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function PublicHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/50 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          onClick={closeMobileMenu}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 via-pink-300 to-amber-200 text-lg font-bold text-white shadow-[0_10px_25px_rgba(242,124,156,0.28)]">
            <img
  src="/brand/logoNTV.png"
  alt="Logo"
  className="h-8 w-8 object-contain"
/>
          </div>

          <div className="flex min-w-0 flex-col">
            {/* <span className="truncate text-lg font-bold leading-none text-rose-900 sm:text-xl">
              Мамин сайт
            </span> */}
            <span className="truncate text-sm text-stone-600">
              С любовью от семьи
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navigationItems.map((item) => {
            const isActive = isActiveLink(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-rose-100 text-rose-800 shadow-sm"
                    : "text-stone-700 hover:bg-white/80 hover:text-rose-700",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full text-stone-700 hover:bg-rose-100 hover:text-rose-700 md:hidden"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </Button>
      </div>

      {isMobileMenuOpen ? (
        <div className="w-full border-t border-white/50 bg-white/92 px-4 py-4 shadow-[0_14px_30px_rgba(170,110,130,0.12)] backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-2">
            {navigationItems.map((item) => {
              const isActive = isActiveLink(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-base font-semibold transition",
                    isActive
                      ? "bg-rose-100 text-rose-800"
                      : "text-stone-700 hover:bg-rose-50 hover:text-rose-700",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}