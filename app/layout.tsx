import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// ✅ SEO Metadata
export const metadata: Metadata = {
  title: "Task Manager - Team Collaboration",
  description:
    "A fast, efficient task management application with team assignments and local storage",
  keywords: "task manager, productivity, team collaboration, local storage",
  authors: [{ name: "Task Manager Team" }],
  generator: "v0.dev",
};

// ✅ Viewport separately exported
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
