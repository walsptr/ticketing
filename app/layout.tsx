import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "hooks/context/ThemeContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ticketing",
  description: "App for management & ticketing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <html lang="en" className="h-full w-full">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
        >
          {children}
          <Toaster
            richColors
            position="top-right"
            closeButton
            visibleToasts={5}
          />
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ThemeProvider>
  );
}
