import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "amangLy.",
  description: "amangLy. - A personal portfolio by amangly.",
  openGraph: {
    siteName: "amangLy.", // Site name for link previews
    url: "https://amangly.pro", // Absolute URL for the site
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
      </body>
    </html>
  );
}
