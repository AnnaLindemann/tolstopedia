import type { Metadata } from "next";
import { Comfortaa, Nunito, PT_Sans } from "next/font/google";

import "./globals.css";

const comfortaa = Comfortaa({
  subsets: ["cyrillic", "latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const ptSans = PT_Sans({
  subsets: ["cyrillic", "latin"],
  variable: "--font-body",
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["cyrillic", "latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NTV",
  description: "Семейный сайт с поздравлениями для мамы",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body className={`${comfortaa.variable} ${ptSans.variable} ${nunito.variable}`}>
        {children}
      </body>
    </html>
  );
}