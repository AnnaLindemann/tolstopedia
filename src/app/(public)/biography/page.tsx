import { Card, CardContent } from "@/components/ui/card";

export default function BiographyPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/60 bg-white/75 shadow-[0_20px_60px_rgba(202,118,145,0.14)] backdrop-blur-md">
          <CardContent className="space-y-4 p-6 sm:p-8">
            <div className="inline-flex w-fit items-center rounded-full bg-pink-100 px-4 py-1.5 text-sm font-medium text-pink-700">
              Биография
            </div>

            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              История жизни и важные моменты
            </h1>

            <p className="max-w-2xl text-base leading-7 text-stone-700">
              Здесь будет более подробная история о маме: воспоминания, важные
              этапы жизни, фотографии и детали, которые хочется сохранить.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/70 shadow-[0_20px_60px_rgba(202,118,145,0.1)] backdrop-blur-md">
          <CardContent className="space-y-3 p-6 sm:p-8 text-stone-700">
            <h2 className="text-2xl font-bold">Что будет здесь</h2>
            <p>— расширенная биография</p>
            <p>— фотографии по жизненным этапам</p>
            <p>— важные даты и тёплые истории</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}