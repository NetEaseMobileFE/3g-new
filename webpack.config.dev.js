var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
  devtool: '#cheap-module-eval-source-map',
  context: path.join(__dirname, 'src'),
  entry: {
    article: './article/index',
    special: './special/index'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
    publicPath: '/static/'
  },
  module: {
    loaders: [
      { 
        test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" 
      }, {
        test: /\.css$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")
      }, {
        test: /\.scss$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
      }, {
        test: /\.less$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
      }

    ]
  },
  plugins: [
    new ExtractTextPlugin("css/[name].css")
  ]
};
