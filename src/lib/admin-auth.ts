import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "admin_auth";
export const ADMIN_COOKIE_VALUE = "true";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();

  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_COOKIE_VALUE;
}