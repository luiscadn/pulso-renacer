import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Poppins } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["600", "700"], display: "swap" });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Pulso Renacer", template: "%s · Pulso Renacer" },
  description: "Comunicación interna de Renacer Clínica y Spa.",
  applicationName: "Pulso Renacer",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Pulso Renacer", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#8C4256",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${cormorant.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
