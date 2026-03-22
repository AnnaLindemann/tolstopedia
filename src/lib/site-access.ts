import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

import { connectToDatabase } from "./db";
import { SiteSettingsModel, type SiteSettingsDocument } from "../models/site-settings.model";

const SITE_ACCESS_COOKIE_NAME = "site_access";
const SITE_ACCESS_JWT_SECRET = process.env.SITE_ACCESS_JWT_SECRET;
const SHARED_SITE_PASSWORD = process.env.SHARED_SITE_PASSWORD as string;

if (!SITE_ACCESS_JWT_SECRET) {
  throw new Error("SITE_ACCESS_JWT_SECRET is not defined");
}

if (!SHARED_SITE_PASSWORD) {
  throw new Error("SHARED_SITE_PASSWORD is not defined");
}

type SiteAccessSessionPayload = {
  scope: "public-site";
  passwordVersion: number;
};

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(SITE_ACCESS_JWT_SECRET);
}

async function getOrCreateSiteSettings(): Promise<SiteSettingsDocument> {
  await connectToDatabase();

  const existingSettings = await SiteSettingsModel.findOne().exec();

  if (existingSettings) {
    return existingSettings;
  }

  const sharedPasswordHash = await bcrypt.hash(SHARED_SITE_PASSWORD, 10);

  const createdSettings = await SiteSettingsModel.create({
    sharedPasswordHash,
    passwordVersion: 1,
  });

  return createdSettings;
}

export async function verifySharedSitePassword(password: string): Promise<SiteSettingsDocument | null> {
  const siteSettings = await getOrCreateSiteSettings();

  const isValidPassword = await bcrypt.compare(password, siteSettings.sharedPasswordHash);

  if (!isValidPassword) {
    return null;
  }

  return siteSettings;
}

async function createSiteAccessToken(passwordVersion: number): Promise<string> {
  const payload: SiteAccessSessionPayload = {
    scope: "public-site",
    passwordVersion,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getJwtSecret());
}

export async function createSiteAccessSession(passwordVersion: number): Promise<void> {
  const token = await createSiteAccessToken(passwordVersion);
  const cookieStore = await cookies();

  cookieStore.set(SITE_ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSiteAccessSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SITE_ACCESS_COOKIE_NAME);
}

export async function readSiteAccessSession(): Promise<SiteAccessSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SITE_ACCESS_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify<SiteAccessSessionPayload>(token, getJwtSecret());

    if (verified.payload.scope !== "public-site") {
      return null;
    }

    return {
      scope: "public-site",
      passwordVersion: verified.payload.passwordVersion,
    };
  } catch {
    return null;
  }
}

export async function requirePublicSiteAccess(): Promise<void> {
  const session = await readSiteAccessSession();

  if (!session) {
    redirect("/site-login");
  }

  const siteSettings = await getOrCreateSiteSettings();

  if (session.passwordVersion !== siteSettings.passwordVersion) {
    await clearSiteAccessSession();
    redirect("/site-login");
  }
}

export async function redirectIfPublicSiteAlreadyUnlocked(): Promise<void> {
  const session = await readSiteAccessSession();

  if (!session) {
    return;
  }

  const siteSettings = await getOrCreateSiteSettings();

  if (session.passwordVersion === siteSettings.passwordVersion) {
    redirect("/");
  }

  await clearSiteAccessSession();
}