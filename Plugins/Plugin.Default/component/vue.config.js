const { defineConfig } = require('@vue/cli-service')
//const { ModuleFederationPlugin } = require('webpack').container;
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
//const { RawSource } = require('webpack-sources');

module.exports = defineConfig({
  transpileDependencies: [
    'quasar'
  ],

  publicPath: '/Plugins/Plugin.Default/component/dist/',

  configureWebpack: {
    plugins: [
      new ModuleFederationPlugin({
        name: 'remoteApp',
        filename: 'remoteEntry.js',
        exposes: {
          './RemoteComponent': './src/components/RemoteComponent.vue',
          './CustomControl': './src/components/CustomControl.vue',
          './App': './src/components/CustomControl.vue'
        },
        shared: {
          vue: { singleton: true, eager: true, requiredVersion: '^3.0.0' },
          quasar: { singleton: true, eager: true, requiredVersion: '^2.0.0' }, // Share Quasar if used
        },
      }),
      // Custom plugin to expose the container
      // {
      //   apply(compiler) {
      //     compiler.hooks.thisCompilation.tap('ExposeRemoteApp', (compilation) => {
      //       compilation.hooks.processAssets.tap(
      //         {
      //           name: 'ExposeRemoteApp',
      //           stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
      //         },
      //         () => {
      //           const remoteEntryAsset = compilation.assets['remoteEntry.js'];
      //           if (remoteEntryAsset) {
      //             const originalSource = remoteEntryAsset.source();
      //             const modifiedSource = `${originalSource}\nwindow.remoteApp = remoteApp;`;
      //             // Use RawSource to ensure compatibility with Terser
      //             compilation.updateAsset('remoteEntry.js', new RawSource(modifiedSource));
      //           }
      //         }
      //       );
      //     });
      //   },
      // },
    ],
    output: {
      library: 'remoteApp', // Expose the module as a global variable
      libraryTarget: 'window', // Attach it to the window object
    },
    optimization: {
      splitChunks: false,
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: 'asset/resource', // Bundle images as separate files
          generator: {
            filename: 'assets/[name].[hash][ext]', // Output path for images
          },
        },
      ],
    },
  },

  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  },

  devServer: {
    port: 8080,
    open: true,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:9000",
      "Access-Control-Allow-Methods": "GET",
    },
  },
})
