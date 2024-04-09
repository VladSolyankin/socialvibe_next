"use client";

import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { DesktopLayout } from "./components/layouts/DesktopLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
