import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Cal & Euge — Wedding",
  description: "You're invited to Cal & Euge's wedding at Villa Bettoni!",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤️</text></svg>",
  },
  openGraph: {
    title: "Cal & Euge — Wedding",
    description: "You're invited to Cal & Euge's wedding at Villa Bettoni!",
    images: [
      {
        url: "/cal_and_euge_and_luke.png",
        width: 1024,
        height: 1024,
        alt: "Cal, Euge & Luke",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cal & Euge — Wedding",
    description: "You're invited to Cal & Euge's wedding at Villa Bettoni!",
    images: ["/cal_and_euge_and_luke.png"],
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
