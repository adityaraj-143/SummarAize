import type { Metadata } from "next";
import { Source_Sans_3 as FontSans } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { shadcn } from "@clerk/ui/themes";
import Providers from "@/lib/context/Chatcontext";

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
    <ClerkProvider
      appearance={{
        baseTheme: shadcn,
      }}
    >
      <html lang="en">
        <Providers>
          <body className={`${fonstSans.variable} bg-background antialiased`}>
            <NavBar />
            {children}
            <Toaster />
          </body>
        </Providers>
      </html>
    </ClerkProvider>
  );
}
