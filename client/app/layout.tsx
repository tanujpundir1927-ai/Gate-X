import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "GateX - Smart QR Event Entry Management",
  description: "Eliminate fake passes, duplicate entries, and check-in chaos with the GateX secure QR ticketing system.",
  keywords: ["QR scanner", "event management", "pass validation", "college fest", "entry system"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-black text-white antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
