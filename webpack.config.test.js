var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
process.env.NODE_ENV = 'production'

module.exports = {
  devtool: 'source-map',
  context: path.join(__dirname, 'src'),
  entry: {
    article: ['./article/index'],
    special: ['./special/index']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name].js',
    publicPath: '/static/'
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
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("css/[name].css"),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': 'production'
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