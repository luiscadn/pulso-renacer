import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pulso Renacer",
    short_name: "Pulso",
    description: "Comunicación interna de Renacer Clínica y Spa.",
    start_url: "/inicio",
    display: "standalone",
    background_color: "#F7EFEF",
    theme_color: "#8C4256",
    lang: "es-CO",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
