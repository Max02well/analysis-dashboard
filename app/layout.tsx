import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import DashboardLayout from "@/components/shared/DashboardLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vulnerability Analysis Dashboard",
  description: "A simple dashboard for analyzing vulnerabilities in assets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ThemeProvider>
      <DashboardLayout userName="Maxwell" userRole="Security Analyst" notificationCount={3}>
        <html
          lang="en"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
          <body className="min-h-full flex flex-col">{children}</body>
        </html>
      </DashboardLayout>
    </ThemeProvider>
  );
}
