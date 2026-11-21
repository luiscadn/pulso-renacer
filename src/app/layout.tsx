import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Pulso Renacer", template: "%s · Pulso Renacer" },
  description: "Comunicación interna de Renacer Clínica y Spa.",
  applicationName: "Pulso Renacer",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Pulso Renacer", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#6B8F71",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
