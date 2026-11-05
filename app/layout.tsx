import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rebag — Design studio",
  description: "A clear blueprint and your approval before a maker reviews your design.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
