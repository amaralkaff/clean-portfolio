import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "amangLy.",
  description: "amangLy. - A personal portfolio by amangly.",
  openGraph: {
    siteName: "amangLy.",
    url: "https://amangly.pro",
    images: [
      {
        url: "https://amangly.pro/images/image.png",
        alt: "amangLy. Portfolio Preview Image",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
