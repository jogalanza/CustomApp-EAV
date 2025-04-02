import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  base: "/Plugins/Plugin.Default/component/dist",
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      autoImportComponentCase: 'pascal',
    }),
    federation({
      name: 'remote-app',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button.vue', // Expose a component
        './Home': './src/views/Home.vue',
      },
      shared: ['vue'], // Shared dependencies
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
