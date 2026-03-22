import { connectToDatabase } from "@/lib/db";
import { MomPageModel, type MomPage } from "@/models/mom-page.model";

// Temporary: old DB documents may have a flat heroImageUrl string instead of
// the current nested heroImage: { url, publicId } shape.
// Remove this type and the normalization block once the DB document is migrated
// (i.e., after running: npx tsx src/scripts/seed-mom-page.ts).
type RawMomPage = Omit<MomPage, "heroImage"> & {
  heroImage?: { url: string; publicId: string };
  heroImageUrl?: string;
};

export async function getMomPage(): Promise<MomPage | null> {
  await connectToDatabase();

  const raw = await MomPageModel.findOne().lean<RawMomPage | null>();

  if (!raw) {
    return null;
  }

  // Prefer the new nested heroImage; fall back to old flat heroImageUrl temporarily.
  // TODO: remove heroImageUrl branch after running seed-mom-page script.
  const heroImage =
    raw.heroImage ??
    (raw.heroImageUrl ? { url: raw.heroImageUrl, publicId: "" } : null);

  if (!heroImage) {
    return null;
  }

  return { ...raw, heroImage } as MomPage;
}
