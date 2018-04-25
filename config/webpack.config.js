const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const rootDir = path.resolve(__dirname, '..')
const guiDir = path.resolve(rootDir, 'gui')
module.exports = (env, argv) => ({
  mode:'development',
  entry: path.resolve(guiDir, 'src/index.js'),
  output: {
    filename: 'bundle.js',
    /*publicPath: '/assets',*/
    path: path.resolve(guiDir, 'dist')
  },
  module:{
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    },
    {
      test: /\.scss$/,
      use: [{
        loader: "style-loader" // creates style nodes from JS strings
      }, {
        loader: "css-loader" // translates CSS into CommonJS
      }, {
        loader: "sass-loader" // compiles Sass to CSS
      }]
    },
    {
      test: /\.(png|jp(e*)g|svg)$/,  
      use: [{
        loader: 'url-loader',
        options: { 
          limit: 8000, // Convert images < 8kb to base64 strings
          name: 'images/[hash]-[name].[ext]'
        } 
      }]
    }]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      'scss': path.resolve(guiDir,'src/scss/')
    }/*,
    extensions: ['*', '.js', '.vue', '.json']
    */
  },
  plugins: [new HtmlWebpackPlugin({
    title:'Audio Remote',
    template: path.resolve(guiDir, 'src/index.ejs')
  })/*,
  new webpack.DefinePlugin({
    __API__: argv.mode === 'production' ? '""' : '"http://ubuntu.local/audio/"'
  })*/
  ],
  devServer: {
    contentBase:  path.resolve(guiDir, 'dist'),
    disableHostCheck: true, //so the host's name can be aliased,
    public: "ubuntu.local/audio-dev/sockjs-node",
    proxy: {
      "/api": {
        target: "http://localhost:3000"
      }
    }
  }
})
