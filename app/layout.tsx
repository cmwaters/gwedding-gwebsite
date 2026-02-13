import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cal & Euge — Wedding",
  description: "You're invited to Cal & Euge's wedding at Villa Bettoni!",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤️</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased m-0 p-0 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
