const { defineConfig } = require('@vue/cli-service')
//const { ModuleFederationPlugin } = require('webpack').container;
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

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
        // shared: {
        //   vue: {
        //     singleton: true,
        //     eager: true,
        //     requiredVersion: '^3.0.0'
        //   }
        // }
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all', // Bundle vendor code (e.g., Vue, Quasar) into separate chunks
      },
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
  }
})
