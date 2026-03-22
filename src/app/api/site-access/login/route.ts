import { NextResponse } from "next/server";

import { createSiteAccessSession, verifySharedSitePassword } from "@/lib/site-access";

export async function POST(request: Request) {
  const formData = await request.formData();
  const passwordValue = formData.get("password");

  if (typeof passwordValue !== "string") {
    return NextResponse.redirect(new URL("/site-login?error=invalid-password", request.url));
  }

  const password = passwordValue.trim();
  const siteSettings = await verifySharedSitePassword(password);

  if (!siteSettings) {
    return NextResponse.redirect(new URL("/site-login?error=invalid-password", request.url));
  }

  await createSiteAccessSession(siteSettings.passwordVersion);

  return NextResponse.redirect(new URL("/", request.url));
}