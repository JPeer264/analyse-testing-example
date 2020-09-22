const { src, series, dest, watch, parallel } = require('gulp')
const browserSync = require('browser-sync').create()
const postcss = require('gulp-postcss')
const purgecss = require('@fullhuman/postcss-purgecss')
const sass = require('gulp-sass')
const autoprefixer = require('autoprefixer')
const tailwind = require('tailwindcss')
const babel = require('gulp-babel')
const cssnano = require('cssnano')
const rcs = require('gulp-rcs')

sass.compiler = require('node-sass')

function css() {
  return src('./static/assets/**/*.scss')
    .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(postcss([
      tailwind()
    ]))
    .pipe(rcs())
    .pipe(dest('./static/built/assets/css'))
}

function cssProd() {
  return src('./static/assets/**/*.scss')
    .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(postcss([
      tailwind(),
      autoprefixer({ browserList: ['last 2 versions'] }),
      purgecss({
        content: ['./static/**/*.html'],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        // whitelistPatterns: []
      }),
      cssnano()
    ]))
    .pipe(rcs())
    .pipe(dest('./static/built/assets/css'))
}

function js() {
  return src('./static/assets/**/*.js')
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(rcs())
    .pipe(dest('./static/built/assets/js'))
}

function jsProd() {
  return src('./static/assets/**/*.js')
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(rcs())
    .pipe(dest('./static/built/assets/js'))
}

function html() {
  return src('./static/**/*.html')
    .pipe(rcs())
    .pipe(dest('./static/built'))
}


function htmlProd() {
  return src('./static/*.html')
    .pipe(rcs())
    // here you could add some more pipes for your HTML, maybe a minifier? -> https://github.com/alferov/awesome-gulp
    .pipe(dest('./static/built'))
}

function sync(done) {
  browserSync.init({
    server: {
      baseDir: './static'
    },
    notify: false,
    port: 3002,
    ui: { port: 3003 },
    reloadDelay: 1000
  })
  // here you are already watching html files, good ;)
  watch(['./static/**/*.js', './static/**/*.html', './static/**/*.scss', 'tailwind.config.js']).on("change", browserSync.reload)
  done()
}

const cssWatcher = () => watch('./static/assets/**/*.scss', css)
const jsWatcher = () => watch('./static/assets/**/*.js', js)

const watchers = parallel(cssWatcher, jsWatcher)

exports.default = series(css, js, html, sync, watchers)
exports.build = series(cssProd, jsProd, htmlProd)
