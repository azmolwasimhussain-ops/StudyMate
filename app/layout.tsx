import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StudyMate — Your Personal AI Study Partner",
    template: "%s | StudyMate",
  },
  description:
    "StudyMate turns your notes and study material into an interactive AI study partner. Upload PDFs, ask questions, generate quizzes, and create personalized study plans powered by open-weight AI.",
  keywords: [
    "study partner",
    "AI study",
    "PDF chat",
    "quiz generator",
    "study planner",
    "Gemma AI",
    "open source AI",
    "student tools",
  ],
  authors: [{ name: "StudyMate" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "StudyMate — Your Personal AI Study Partner",
    description:
      "Turn your study material into an interactive AI study partner. Powered by open-weight AI.",
    siteName: "StudyMate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-[#0a0a0f] text-white">
        {children}
      </body>
    </html>
  );
}
