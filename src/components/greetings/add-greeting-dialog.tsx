"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormValues = {
  name: string;
  relation: string;
  message: string;
  externalVideoUrl: string;
  externalVideoPreviewImageUrl: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type SubmitSuccessData = {
  greetingId: string;
  editToken: string;
};

const initialValues: FormValues = {
  name: "",
  relation: "",
  message: "",
  externalVideoUrl: "",
  externalVideoPreviewImageUrl: "",
};

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  const trimmedName = values.name.trim();
  const trimmedRelation = values.relation.trim();
  const trimmedMessage = values.message.trim();
  const trimmedExternalVideoUrl = values.externalVideoUrl.trim();
  const trimmedPreviewImageUrl = values.externalVideoPreviewImageUrl.trim();

  if (!trimmedName) {
    errors.name = "Введите имя";
  } else if (trimmedName.length > 80) {
    errors.name = "Имя слишком длинное";
  }

  if (trimmedRelation.length > 80) {
    errors.relation = "Слишком длинное значение";
  }

  if (trimmedMessage.length > 3000) {
    errors.message = "Сообщение слишком длинное";
  }

  if (trimmedExternalVideoUrl && !isValidUrl(trimmedExternalVideoUrl)) {
    errors.externalVideoUrl = "Введите корректную ссылку";
  }

  if (trimmedPreviewImageUrl && !isValidUrl(trimmedPreviewImageUrl)) {
    errors.externalVideoPreviewImageUrl = "Введите корректную ссылку";
  }

  if (!trimmedMessage && !trimmedExternalVideoUrl) {
    errors.message = "Добавьте текст поздравления или ссылку на видео";
  }

  if (trimmedPreviewImageUrl && !trimmedExternalVideoUrl) {
    errors.externalVideoPreviewImageUrl =
      "Превью-картинка возможна только вместе со ссылкой на видео";
  }

  return errors;
}

export function AddGreetingDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<SubmitSuccessData | null>(null);
  const [copyState, setCopyState] = useState<"" | "error">("");

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function resetForm() {
    setValues(initialValues);
    setErrors({});
    setSubmitError("");
    setIsSubmitting(false);
    setSuccessData(null);
    setCopyState("");
  }

  function closeDialog() {
    setOpen(false);
    resetForm();
  }

  function openDialog() {
    setOpen(true);
  }

  function handleValueChange<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });

    if (submitError) {
      setSubmitError("");
    }
  }

  function handleInputChange(
    field: keyof FormValues,
  ): (event: ChangeEvent<HTMLInputElement>) => void {
    return (event) => {
      handleValueChange(field, event.target.value);
    };
  }

  function handleTextareaChange(
    event: ChangeEvent<HTMLTextAreaElement>,
  ): void {
    handleValueChange("message", event.target.value);
  }

  function handleOverlayClick(): void {
    closeDialog();
  }

  function handleDialogCardClick(event: MouseEvent<HTMLDivElement>): void {
    event.stopPropagation();
  }

  async function handleCopyEditLink(): Promise<void> {
    if (!successData) {
      return;
    }

    try {
      await navigator.clipboard.writeText(editLink);
      closeDialog();
    } catch {
      setCopyState("error");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/greetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          relation: values.relation.trim(),
          message: values.message.trim(),
          externalVideoUrl: values.externalVideoUrl.trim(),
          externalVideoPreviewImageUrl:
            values.externalVideoPreviewImageUrl.trim(),
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        greetingId?: string;
        editToken?: string;
      };

      if (!response.ok) {
        setSubmitError(data.error ?? "Не удалось сохранить поздравление");
        setIsSubmitting(false);
        return;
      }

      if (!data.greetingId || !data.editToken) {
        setSubmitError("Сервер не вернул ссылку для редактирования");
        setIsSubmitting(false);
        return;
      }

      setSuccessData({
        greetingId: data.greetingId,
        editToken: data.editToken,
      });

      setIsSubmitting(false);
      router.refresh();
    } catch {
      setSubmitError("Не удалось сохранить поздравление");
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        closeDialog();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const editLink =
  successData && typeof window !== "undefined"
    ? `${window.location.origin}/greetings/edit/${successData.greetingId}?token=${successData.editToken}`
    : "";

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-rose-500 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-rose-600"
      >
        Добавить поздравление
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-greeting-title"
          onClick={handleOverlayClick}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-background p-6 shadow-xl"
            onClick={handleDialogCardClick}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="add-greeting-title"
                  className="text-xl font-semibold text-fg"
                >
                  {successData ? "Поздравление сохранено" : "Добавить поздравление"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {successData
                    ? "Сохраните ссылку в надёжное место. По ней вы сможете позже изменить своё поздравление."
                    : "Оставьте тёплые слова для мамы."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg text-muted-foreground transition hover:bg-muted"
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            {successData ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                  Ваше поздравление уже сохранено и появилось на странице.
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editLink">Ссылка для редактирования</Label>
                  <Input id="editLink" value={editLink} readOnly />
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                 <p>Сохраните эту ссылку в заметках, мессенджере или другом надёжном месте.</p>
  <p>Если захотите изменить поздравление, вставьте ссылку в адресную строку браузера.</p>
  <p>Если вы потеряете ссылку, свяжитесь с Сергеем, Антоном или Анной.</p>
                </div>

                {copyState === "error" && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Не удалось скопировать ссылку автоматически. Скопируйте ссылку из поля выше вручную, потом нажмите «Закрыть».
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-fg transition hover:bg-muted"
                  >
                    Закрыть
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyEditLink}
                    className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
                  >
                    Скопировать ссылку и закрыть
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">Имя *</Label>
                  <Input
                    id="name"
                    placeholder="Например, Анна"
                    value={values.name}
                    onChange={handleInputChange("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relation">Кто вы маме</Label>
                  <Input
                    id="relation"
                    placeholder="Например, дочь, подруга, коллега"
                    value={values.relation}
                    onChange={handleInputChange("relation")}
                  />
                  {errors.relation && (
                    <p className="text-sm text-red-600">{errors.relation}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Текст поздравления</Label>
                  <textarea
                    id="message"
                    placeholder="Напишите тёплые слова или воспоминание"
                    className="flex min-h-[140px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    value={values.message}
                    onChange={handleTextareaChange}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-600">{errors.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="externalVideoUrl">Ссылка на внешнее видео</Label>
                  <Input
                    id="externalVideoUrl"
                    placeholder="Например, ссылка на YouTube"
                    value={values.externalVideoUrl}
                    onChange={handleInputChange("externalVideoUrl")}
                  />
                  {errors.externalVideoUrl && (
                    <p className="text-sm text-red-600">
                      {errors.externalVideoUrl}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="externalVideoPreviewImageUrl">
                    Ссылка на превью-картинку для внешнего видео
                  </Label>
                  <Input
                    id="externalVideoPreviewImageUrl"
                    placeholder="Необязательно"
                    value={values.externalVideoPreviewImageUrl}
                    onChange={handleInputChange("externalVideoPreviewImageUrl")}
                  />
                  {errors.externalVideoPreviewImageUrl && (
                    <p className="text-sm text-red-600">
                      {errors.externalVideoPreviewImageUrl}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Загрузка фото и видео будет добавлена следующим шагом.
                </div>

                {hasErrors && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Проверьте форму: есть ошибки в заполнении.
                  </div>
                )}

                {submitError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-fg transition hover:bg-muted"
                  >
                    Отмена
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Сохранение..." : "Сохранить поздравление"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}