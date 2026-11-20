import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Piggy Bank — Gestor de gastos",
    short_name: "Piggy Bank",
    description: "Controlá tus gastos, cuentas y metas de ahorro.",
    lang: "es-AR",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#121316",
    theme_color: "#121316",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Cargar gasto",
        short_name: "Gasto",
        description: "Anotar un gasto rápido",
        url: "/dashboard?nuevo=gasto",
        icons: [{ src: "/icons/shortcut-gasto.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Cargar ingreso",
        short_name: "Ingreso",
        url: "/dashboard?nuevo=ingreso",
        icons: [{ src: "/icons/shortcut-gasto.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Movimientos",
        url: "/dashboard/transactions",
        icons: [{ src: "/icons/shortcut-gasto.png", sizes: "96x96", type: "image/png" }],
      },
    ],
  };
}
