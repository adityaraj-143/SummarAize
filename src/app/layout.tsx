import type { Metadata } from "next";
import { Source_Sans_3 as FontSans } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { Toaster } from "sonner";
import {dark} from "@clerk/themes"

const fonstSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Summaraize - AI-Powered PDF Summarization",
  description:
    "Save hours of reading time. Transform lengthy PDFs into clear, accurate summaries in seconds with our advanced AI technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark
    }}>
      <html lang="en">
        <body className={`${fonstSans.variable} bg-black/[0.96] antialiased`}>
          <div className="w-full relative flex items-center justify-center mt-5">
            <NavBar />
          </div>
          {children}
          <Toaster/>
        </body>
      </html>
    </ClerkProvider>
  );
}
