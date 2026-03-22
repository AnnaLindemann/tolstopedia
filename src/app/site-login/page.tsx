import { redirectIfPublicSiteAlreadyUnlocked } from "@/lib/site-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SiteLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string): string | null {
  if (error === "invalid-password") {
    return "Неверный пароль. Попробуйте ещё раз.";
  }

  return null;
}

export default async function SiteLoginPage({ searchParams }: SiteLoginPageProps) {
  await redirectIfPublicSiteAlreadyUnlocked();

  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams.error);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-40px] top-16 h-40 w-40 rounded-full bg-pink-200/45 blur-3xl" />
        <div className="absolute right-[-30px] top-24 h-52 w-52 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-rose-100/50 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-xl border-white/60 bg-white/75 shadow-[0_20px_60px_rgba(202,118,145,0.18)] backdrop-blur-md">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-3">
         
            <div className="space-y-3">
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                Добро пожаловать
              </h1>

              <p className="max-w-md text-base leading-7 text-stone-600">
                Этот сайт создан с любовью для мамы. Введите общий пароль, чтобы
                открыть страницы с поздравлениями, фотографиями и тёплыми словами.
              </p>
            </div>
          </div>

          <form action="/api/site-access/login" method="POST" className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-semibold text-stone-700">
                Введите пароль
              </Label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Пароль сайта"
                required
                className="h-12 rounded-2xl border-rose-200 bg-white/90 px-4 text-base shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-rose-300"
              />
            </div>

            {errorMessage ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-12 w-full rounded-2xl border-0 bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 text-base font-semibold text-white shadow-[0_10px_30px_rgba(242,124,156,0.35)] transition hover:scale-[1.01] hover:from-rose-500 hover:via-pink-500 hover:to-amber-400"
            >
              Открыть сайт
            </Button>
          </form>

          <div className="mt-6 rounded-2xl bg-white/65 px-4 py-3 text-sm leading-6 text-stone-600">
            Здесь вас ждут фотографии, видео, история и поздравления от близких.
          </div>
        </CardContent>
      </Card>
    </main>
  );
}