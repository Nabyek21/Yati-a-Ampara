import { defineConfig } from 'vite';
import astro from '@astrojs/vite-plugin-astro';

export default defineConfig({
  plugins: [astro()],
  server: {
    mimeTypes: {
      '.html': 'text/html; charset=utf-8'
    }
  }
});
