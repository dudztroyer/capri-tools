import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Capri Tools",
    short_name: "Capri Tools",
    description: "Ferramentas para tabelas de maré e horários de lancha",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["utilities", "navigation"],
    scope: "/",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    launch_handler: {
      client_mode: "focus-existing",
    },
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "A lancha passa?",
        short_name: "Lancha",
        description: "Verificar horários de passagem da lancha",
        url: "/a-lancha-passa",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Tábua de Maré Mensal",
        short_name: "Maré",
        description: "Consultar tabela de marés mensal",
        url: "/tide-table",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}

