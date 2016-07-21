const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec

const argv = require('yargs').argv
const vftp = require('vinyl-ftp')
const gulp = require('gulp')
const gutil = require('gulp-util')
const rimraf = require('rimraf')
const htmlmin = require('gulp-htmlmin')
const htmlreplace = require('gulp-html-replace')
const webpackStream = require('webpack-stream')

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const profile = JSON.parse(fs.readFileSync('.profile', 'utf-8'))

let webpackConfig = require('./webpack.config.prod')
const testMode = gutil.env._.indexOf('test') >= 0
if (testMode) {
  webpackConfig = require('./webpack.config.dev');
}
let webpackStats = null

gulp.task('clean', function(cb) {
  rimraf('dist', function(err) {
    if (err) {
      throw new gutil.PluginError("clean", err)
    }
    cb()
  })
})

gulp.task('assets', ['clean'], function() {
  const which = argv.w
  if (which === true) {
    throw new Error('Type needed here, such as gulp deploy -w article')
    return
  }
  return gulp.src(which ? `src/${which}/index.js` : 'src/**/index.js').pipe(webpackStream(webpackConfig, null, function(err, stats) {
    webpackStats = stats.toJson({
      chunks: true,
      modules: true,
      chunkModules: true,
      reasons: true,
      cached: true,
      cachedAssets: true
    });
    return fs.writeFile('./analyse.log', JSON.stringify(webpackStats), null, 2);
  })).pipe(gulp.dest('dist'));
});