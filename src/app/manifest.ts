import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pulso Renacer",
    short_name: "Pulso",
    description: "Comunicación interna de Renacer Clínica y Spa.",
    start_url: "/inicio",
    display: "standalone",
    background_color: "#FBF8F3",
    theme_color: "#6B8F71",
    lang: "es-CO",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
