import Image from "next/image";

import { getOrCreateBiographyPage } from "@/lib/biography";

export default async function BiographyPage() {
  const biographyPage = await getOrCreateBiographyPage();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-900">
          {biographyPage.title}
        </h1>
      </section>

      <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
        {biographyPage.mainImage?.url ? (
          <div className="mb-6 md:float-left md:mb-4 md:mr-8 md:w-[280px] lg:w-[320px]">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={biographyPage.mainImage.url}
                  alt={biographyPage.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="text-[15px] leading-7 text-neutral-700 whitespace-pre-line">
          {biographyPage.content}
        </div>

        <div className="clear-both" />
      </article>
    </div>
  );
}