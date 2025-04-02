import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      autoImportComponentCase: 'pascal',
    }),
    federation({
      name: 'host-app',
      remotes: {},
      shared: ['vue'], // Shared dependencies
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
