import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Office Power Rankings",
  description: "A wildly unscientific, completely unofficial employee leaderboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-100 antialiased">{children}</body>
    </html>
  );
}
