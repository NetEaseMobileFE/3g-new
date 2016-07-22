'use strict'
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
process.env.NODE_ENV = 'production'

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: {
    article: ['./article/index'],
    special: ['./special/index']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name].[chunkhash].js',
    publicPath: `/utf8/${packageJson.name}/`
  },
  module: {
    loaders: [
      { 
        test: /\.js$/, 
        exclude: /node_modules/, 
        loader: "babel-loader" 
      }, {
        test: /\.css$/, 
        exclude: /node_modules/, 
        loader: ExtractTextPlugin.extract("style", "css!postcss")
      }, {
        test: /\.scss$/, 
        exclude: /node_modules/, 
        loader: ExtractTextPlugin.extract("style", "css!postcss!sass")
      }, {
        test: /\.less$/,
        exclude: /node_modules/, 
        loader: ExtractTextPlugin.extract("style", "css!postcss!less")
      }, {
        test: /\.png|jpe?g|gif$/,
        loader: "url-loader?limit=5000&name=img/[hash].[ext]",
        include: path.join(__dirname, 'src/img')
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("css/[name].[chunkhash].css"),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': 'production'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new webpack.NoErrorsPlugin()
  ],
  postcss: function() {
    return [
      require("postcss-cssnext")({
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'not ie <= 8', 'Android >= 4.0']
      })
    ]
  }
};