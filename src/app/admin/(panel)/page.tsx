export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-neutral-900">Панель администратора</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Это главная страница админки для MVP семейного сайта.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900">Страница мамы</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Редактирование главного текста, превью биографии и содержимого главной страницы.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900">Поздравления</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Просмотр, редактирование и удаление опубликованных поздравлений.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900">Медиа-страницы</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Управление галереей, видео и разделом биографии.
          </p>
        </div>
      </section>
    </div>
  );
}