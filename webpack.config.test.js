const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const cssnext = require('postcss-cssnext')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const profile = JSON.parse(fs.readFileSync('.profile', 'utf-8'))
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const entry = packageJson.pages.reduce((prev, curr) => {
  return Object.assign(prev, {
    [curr]: [`./${curr}/index`]
  })
}, {})
process.env.NODE_ENV = 'production'

module.exports = {
  devtool: 'source-map',
  context: path.join(__dirname, 'src'),
  entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name].js',
    publicPath: `/${profile.f2e.name}/${packageJson.name}/`
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }, {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss')
      }, {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss!sass')
      }, {
        test: /\.less$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss!less')
      }, {
        test: /\.png|jpe?g|gif$/,
        loader: 'url-loader?limit=5000&name=img/[hash].[ext]',
        include: path.join(__dirname, 'src/img')
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('css/[name].css'),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: 'production'
      }
    }),
    new webpack.NoErrorsPlugin()
  ],
  postcss: () => {
    return [
      cssnext({
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'not ie <= 8', 'Android >= 4.0']
      })
    ]
  }
}
