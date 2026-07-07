// paye-frontend/app/layout.tsx
import type { Metadata } from "next";
import { Outfit, Poppins, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Paye - Find Your Hambash",
  description: "Workout with the right partner",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${poppins.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background">
        <QueryProvider>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
