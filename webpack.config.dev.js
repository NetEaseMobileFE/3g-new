'use strict'
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
process.env.NODE_ENV = 'development'
const entry = packageJson.pages.reduce((prev, curr) => {
  return Object.assign(prev, {
    [curr]: [`./${curr}/index`, 'webpack-hot-middleware/client?reload=true']
  })
}, {})

module.exports = {
  devtool: '#cheap-module-eval-source-map',
  context: path.join(__dirname, 'src'),
  entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
    publicPath: '/'
  },
  module: {
    loaders: [
      { 
        test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" 
      }, {
        test: /\.css$/, exclude: /node_modules/, loader: "style-loader!css-loader"
      }, {
        test: /\.scss$/, exclude: /node_modules/, loader: "style-loader!css-loader!sass-loader"
      }, {
        test: /\.less$/, exclude: /node_modules/, loader: "style-loader!css-loader!less-loader"
      }, {
        test: /\.png|jpe?g|gif$/,
        loader: "url-loader?limit=1",
        include: path.join(__dirname, 'src/img')
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      DEBUG: true
    })
  ]
};
