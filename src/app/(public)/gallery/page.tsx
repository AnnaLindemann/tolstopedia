import GalleryGrid from "@/components/gallery/gallery-grid";
import { getPublishedGalleryItems } from "@/lib/gallery";

export default async function GalleryPage() {
  const items = await getPublishedGalleryItems();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-900">Галерея</h1>
            </section>

      <GalleryGrid
        items={items}
        emptyText="Пока нет фотографий."
      />
    </div>
  );
}