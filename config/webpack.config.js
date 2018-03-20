const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const rootDir = path.resolve(__dirname, '..')
const guiDir = path.resolve(rootDir, 'gui')
module.exports = {
  mode:'development',
  entry: path.resolve(guiDir, 'src/index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(guiDir, 'dist')
  },
  module:{
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    }]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }/*,
    extensions: ['*', '.js', '.vue', '.json']
    */
  },
  plugins: [new HtmlWebpackPlugin({
    title:'Audio Remote',
    template: path.resolve(guiDir, 'src/index.ejs')
  })]
}
