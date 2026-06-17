import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Absolute, forward-slash path so the injected @use resolves in both the build
// and the Vitest transform (loadPaths is not reliably applied under Vitest).
const stylesDir = fileURLToPath(new URL('./src/styles', import.meta.url)).replace(/\\/g, '/');

// https://vite.dev/config/
export default defineConfig({
  // Served from a repo subpath on GitHub Pages.
  base: '/vue-project-task-manager/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [stylesDir],
        // Inject output-free partials (SCSS variables + mixins) into every block.
        additionalData: `@use "${stylesDir}/variables" as *;\n@use "${stylesDir}/mixins" as *;\n`,
      },
    },
  },
});
