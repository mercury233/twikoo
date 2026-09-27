const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ROOT_PATH = path.resolve(__dirname)
const BUILD_PATH = path.resolve(ROOT_PATH, 'dist')
const version = require('./package.json').version
const TerserPlugin = require('terser-webpack-plugin')
const banner =
  'Twikoo v' + version + '\n' +
  '(c) 2020-' + new Date().getFullYear() + ' iMaeGoo\n' +
  'Released under the MIT License.\n' +
  'Last Update: ' + (new Date()).toLocaleString()

function getConfig () {
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
        { test: /\.css$/, use: ['vue-style-loader', 'css-loader'] },
        { test: /\.svg$/, loader: 'svg-inline-loader' },
        { test: /\.js$/, exclude: /node_modules[\\/](webpack|webpack-dev-server|webpack-cli)[\\/]/, use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'], plugins: ['@babel/transform-runtime'] } } }
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
    target: ['web', 'es5'],
    plugins: [
      new webpack.BannerPlugin(banner),
      new CopyPlugin({
        patterns: [
          { from: 'demo/', to: './' }
        ]
      }),
      new VueLoaderPlugin(),
      new TerserPlugin({
        parallel: 4,
        terserOptions: {
          ecma: 5,
          toplevel: true
        }
      })
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
