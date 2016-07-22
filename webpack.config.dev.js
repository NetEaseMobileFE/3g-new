var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
process.env.NODE_ENV = 'development'

module.exports = {
  devtool: '#cheap-module-eval-source-map',
  context: path.join(__dirname, 'src'),
  entry: {
    article: ['./article/index', 'webpack-hot-middleware/client?reload=true'],
    special: ['./special/index', 'webpack-hot-middleware/client?reload=true']
  },
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
