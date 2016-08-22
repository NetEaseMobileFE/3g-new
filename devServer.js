const path = require('path')
var express = require('express')
var webpack = require('webpack')
var config = require('./webpack.config.dev')

var app = express()
var compiler = webpack(config)

//app.use('/static', express.static(__dirname + '/dist'))
app.use(express.static('mocks'))
app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath,
    stats: {
      colors: true
    }
}))

app.use(require('webpack-hot-middleware')(compiler))

app.get('/page/:type', function (req, res, next) {
  if (!req.params.type.match(/map$/)) {
    res.sendFile(path.join(__dirname, 'src', req.params.type, 'index.html'))
  } else {
    next()
  }
})
app.get('/favicon.ico', function(req, res) {
  res.sendFile(path.join(__dirname, 'favicon.ico'))
})

app.listen(3100, function (err) {
    if (err) {
      console.log(err)
      return
    }
    console.log('Listening at http://localhost:3100')
})
