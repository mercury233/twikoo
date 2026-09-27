const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ROOT_PATH = path.resolve(__dirname)
const BUILD_PATH = path.resolve(ROOT_PATH, 'dist')
const version = require('./package.json').version
const banner =
  'Twikoo v' + version + '\n' +
  '(c) 2020-' + new Date().getFullYear() + ' iMaeGoo\n' +
  'Released under the MIT License.\n' +
  'Last Update: ' + (new Date()).toLocaleString()

function getConfig() {
  return {
    resolve: {
      alias: {
        // 统一项目的 ESM 导入和 Element UI 的 CommonJS 引用，避免打包两份 Vue。
        'vue$': 'vue/dist/vue.runtime.esm.js'
      }
    },
    module: {
      rules: [
        { test: /\.vue$/, loader: 'vue-loader' },
        {
          test: /\.vue$/,
          resourceQuery: /^$/,
          enforce: 'post',
          loader: path.resolve(__dirname, 'loaders/vue-style-imports.js')
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            { loader: 'css-loader', options: { importLoaders: 1 } },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [require('autoprefixer')()]
                }
              }
            }
          ]
        },
        { test: /\.svg$/, loader: 'svg-inline-loader' },
        { test: /\.js$/, exclude: /node_modules[\\/](webpack|webpack-dev-server|webpack-cli)[\\/]/, use: 'babel-loader' }
      ]
    },
    entry: {
      twikoo: './src/client/main.js'
    },
    output: {
      path: BUILD_PATH,
      filename: '[name].min.js',
      library: 'twikoo',
      libraryTarget: 'umd',
      globalObject: 'this'
    },
    target: 'browserslist',
    plugins: [
      new webpack.BannerPlugin(banner),
      new CopyPlugin({
        patterns: [
          { from: 'demo/', to: './' }
        ]
      }),
      new VueLoaderPlugin()
    ],
    devServer: {
      static: [{
        directory: BUILD_PATH,
        publicPath: '/dist/',
        serveIndex: true,
        watch: true
      }],
      port: 9820,
      host: '0.0.0.0',
      open: false,
      hot: true,
      compress: true
    },
    performance: {
      maxEntrypointSize: 524288,
      maxAssetSize: 524288
    }
  }
}

module.exports = getConfig()
