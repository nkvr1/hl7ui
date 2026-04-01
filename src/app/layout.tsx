import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeFab } from "@/components/ThemeFab";
import { BackgroundParticles } from "@/components/BackgroundParticles";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HL7 Patient Timeline Viewer",
  description: "Visualize patient flow from HL7 transformed data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <DataProvider>
            <BackgroundParticles />
            {children}
            <ThemeFab />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
