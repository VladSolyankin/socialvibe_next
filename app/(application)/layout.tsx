"use client";

import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DesktopLayout } from "@/components/layouts/DesktopLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesktopLayout>{children}</DesktopLayout>;
}
