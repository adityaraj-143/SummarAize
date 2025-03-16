import type { Metadata } from "next";
import { Source_Sans_3 as FontSans  } from "next/font/google";
import "./globals.css";

const fonstSans = FontSans({
  variable: "--font-sans",
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700','800', '900']
})

export const metadata: Metadata = {
  title: "Summaraize - AI-Powered PDF Summarization",
  description: 'Save hours of reading time. Transform lengthy PDFs into clear, accurate summaries in seconds with our advanced AI technology.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fonstSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
