import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LuckyDraw.pk - Admin Panel",
  description: "Admin panel for managing LuckyDraw.pk events and prizes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} w-full overflow-x-hidden`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

