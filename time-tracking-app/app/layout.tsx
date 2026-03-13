import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";

const appSans = localFont({
  src: [
    { path: "../public/fonts/3-Cairo Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/4-Cairo SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/5-Cairo Bold.ttf", weight: "700", style: "normal" }
  ],
  variable: "--font-sans",
  display: "swap"
});

const appMono = localFont({
  src: [{ path: "../public/fonts/Gilroy-Regular.ttf", weight: "400", style: "normal" }],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Time Tracking SPA",
  description: "Employee time tracking and daily reporting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${appSans.variable} ${appMono.variable} antialiased min-h-screen bg-slate-950 text-slate-100`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          <Header />
          <main className="container mx-auto p-4">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
