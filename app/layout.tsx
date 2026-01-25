import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Run to Villa Bettoni",
  description: "A wedding game - Help the dog reach Villa Bettoni!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
