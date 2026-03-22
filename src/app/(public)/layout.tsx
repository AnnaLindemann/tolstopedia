import type { ReactNode } from "react";

import { PublicHeader } from "@/components/layout/public-header";
import { requirePublicSiteAccess } from "@/lib/site-access";

type PublicLayoutProps = {
  children: ReactNode;
};

export default async function PublicLayout({ children }: PublicLayoutProps) {
  await requirePublicSiteAccess();

  return (
    <div className="min-h-screen">
      <PublicHeader />
      {children}
    </div>
  );
}