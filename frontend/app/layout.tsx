import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Grinners - Marketing Intelligence",
  description: "Competitor analysis powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
