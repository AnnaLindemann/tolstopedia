import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE } from "@/lib/admin-auth";

type LoginRequestBody = {
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequestBody;
  const password = body.password;

  if (!password) {
    return NextResponse.json(
      { ok: false, error: "Password is required" },
      { status: 400 }
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: "Invalid password" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}