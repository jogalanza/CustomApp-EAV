const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  transpileDependencies: [
    'quasar'
  ],

  // Added for clarity
  publicPath: '/',

  configureWebpack: {
    plugins: [
      new ModuleFederationPlugin({
        name: 'mainApp',
        remotes: {},
        shared: {
          vue: {
            singleton: true,
            eager: true,
            requiredVersion: '^3.0.0'
          }
        }
      })
    ]
  },

  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  }
};
