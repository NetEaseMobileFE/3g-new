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
    filename: 'js/[name].entry.js',
    publicPath: '/static/'
  }
};
