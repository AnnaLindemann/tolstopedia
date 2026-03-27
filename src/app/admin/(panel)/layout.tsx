import { ReactNode } from "react";
import Link from "next/link";
import AdminLogoutButton from "../admin-logout-button";

export default function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
        <aside className="border-r border-neutral-200 bg-white p-6">
          <div className="mb-8">
            <p className="text-lg font-semibold">Админка</p>
            <p className="text-sm text-neutral-500">Сайт для мамы</p>
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block rounded-md px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100"
            >
              Главная
            </Link>
            <Link
              href="/admin/mom-page"
              className="block rounded-md px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100"
            >
              Страница мамы
            </Link>
            <Link
              href="/admin/greetings"
              className="block rounded-md px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100"
            >
              Поздравления
            </Link>
            <Link
              href="/admin/gallery"
              className="block rounded-md px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100"
            >
              Галерея
            </Link>
            <Link
              href="/admin/videos"
              className="block rounded-md px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100"
            >
              Видео
            </Link>
            <Link
              href="/admin/biography"
              className="block rounded-md px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100"
            >
              Биография
            </Link>
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-neutral-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold">Панель администратора</h1>
                <p className="text-sm text-neutral-500">
                  Управление содержимым сайта
                </p>
              </div>

              <AdminLogoutButton />
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}