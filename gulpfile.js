'use strict'
const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec

const argv = require('yargs').argv
const vftp = require('vinyl-ftp')
const gulp = require('gulp')
const gutil = require('gulp-util')
const rimraf = require('rimraf')
const rename = require("gulp-rename")
const htmlmin = require('gulp-htmlmin')
const gulpIgnore = require('gulp-ignore')
const htmlreplace = require('gulp-html-replace')
const webpackStream = require('webpack-stream')

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
const projectName = packageJson.name
const profile = JSON.parse(fs.readFileSync('.profile', 'utf-8'))

let webpackConfig = require('./webpack.config.prod')
const testMode = gutil.env._.indexOf('test') >= 0
if (testMode) {
  webpackConfig = require('./webpack.config.test');
}
let webpackStats = null
const NEWS_TYPE = ['article', 'special', 'live', 'topic', 'question']

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
  checkArgs(which, NEWS_TYPE)
  let config = webpackConfig
  if (which) {
    config = Object.assign({}, config, {
      entry: {
        [which]: [`./${which}/index`]
      }
    })
  }
  return gulp.src(which ? `src/${which}/index.js` : 'src/**/index.js')
  // return gulp.src(`src/article/index.js`)
    .pipe(webpackStream(config, null, function(err, stats) {
    webpackStats = stats.toJson({
      chunks: true,
      modules: true,
      chunkModules: true,
      reasons: true,
      cached: true,
      cachedAssets: true
    })
    return fs.writeFile('./analyse.log', JSON.stringify(webpackStats), null, 2)
  })).pipe(gulp.dest('dist'))
})
gulp.task('f2e', ['assets'], function(cb) {
  const f2e = profile.f2e
  const cmd = `scp -r -P ${f2e.port} dist/* ${f2e.name}@${f2e.host}:/home/${f2e.name}/${projectName}/`
  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      throw new gutil.PluginError("clean", err)
    }
    gutil.log('Done!')
    return cb()
  })
})
gulp.task('test', ['f2e'], function(cb) {
  const which = argv.w || null
  checkArgs(which, NEWS_TYPE)
  const f2e = profile.f2e
  console.log(f2e)
  const apr = "http://f2e.developer.163.com/" + f2e.name + "/" + projectName
  const replacement = which ? {
    [which + 'Style']: `${apr}/css/${which}.css`,
    [which + 'Script']: `${apr}/js/${which}.js`
  } : NEWS_TYPE.reduce((pre, curr) => {
    return Object.assign({}, pre, {
      [curr + 'Style']: `${apr}/css/${curr}.css`,
      [curr + 'Script']: `${apr}/js/${curr}.js`
    })
  }, {})
  return gulp.src(which ? `./src/${which}/index.html` : 'src/**/index.html')
    .pipe(htmlreplace(replacement))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(rename((path) => {
      path.basename = which || path.dirname
      path.dirname = ''
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('ftp', ['assets'], function(cb) {
  var conn = createConnection(profile.ftp.img);
  return gulp.src(['dist/**/*'])
    .pipe(gulpIgnore.exclude(['**/*.map', '*.html']))
    .pipe(conn.dest('/utf8/' + projectName + '/'))
    // .pipe(conn.dest('/utf8/test/'))
})

gulp.task('deploy', ['ftp'], function(cb) {
  const which = argv.w || null
  checkArgs(which, NEWS_TYPE)
  const apr = 'http://img6.cache.netease.com/utf8/3g-new/'
  const assetsNames = webpackStats.assetsByChunkName
  let replacement = {}
  for (const key of Object.keys(assetsNames)) {
    let style = assetsNames[key][1]
    let script = assetsNames[key][0]
    if (!style.match(/css$/)) {
      style = assetsNames[key][0]
      script = assetsNames[key][1]
    }
    replacement[`${key}Style`] = apr + style
    replacement[`${key}Script`] = apr + script
  }
  return gulp.src(which ? `./src/${which}/index.html` : 'src/**/index.html')
    .pipe(htmlreplace(replacement))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(rename((path) => {
      path.basename = which || path.dirname
      path.dirname = ''
    }))
    .pipe(gulp.dest('dist'))
})

function checkArgs(args, types) {
  if (args === true) {
    throw new Error('Type is needed here, such as gulp deploy -w article')
    return null
  }
  if (args && types.indexOf(args) < 0) {
    throw new Error('Type is not exsit, it should be one of below [' + types.join(', ') + ']')
    return null
  }
  return args
}
function createConnection(ftpConfig) {
  var options = {
    host: ftpConfig.host,
    port: ftpConfig.port,
    user: ftpConfig.username,
    password: ftpConfig.password,
    parallel: 5
  };

  if ( ftpConfig.secure ) {
    options.secure = true;
    options.secureOptions = {
      requestCert: true,
      rejectUnauthorized: false
    }
  }

  return vftp.create(options);
}

