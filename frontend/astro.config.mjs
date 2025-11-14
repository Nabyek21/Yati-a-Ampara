// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import fs from "fs";

export default defineConfig({
  integrations: [tailwind()],
  vite: {
    server: {
      mimeTypes: {
        html: "text/html; charset=utf-8",
      },
    },
    plugins: [
      {
        name: "utf8-fix",
        enforce: "post",
        transformIndexHtml(html) {
          // fuerza la codificación UTF-8 antes de servir el HTML
          return html.replace(
            /<head>/i,
            `<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">`
          );
        },
      },
    ],
  },
});
