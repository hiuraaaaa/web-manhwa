import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ManhwaKu",
    template: "%s | ManhwaKu",
  },
  description: "Baca manhwa terjemahan bahasa Indonesia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${sora.variable}`}>
      <body className="bg-bg-base text-text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
