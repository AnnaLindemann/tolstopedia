import type { ReactNode } from "react";

import { requirePublicSiteAccess } from "@/lib/site-access";

type PublicLayoutProps = {
  children: ReactNode;
};

export default async function PublicLayout({ children }: PublicLayoutProps) {
  await requirePublicSiteAccess();

  return <>{children}</>;
}