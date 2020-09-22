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

function css (done) {
    src('./static/assets/**/*.scss')
        .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(postcss([
            tailwind()
        ]))
		.pipe(rcs()) // <-- (optional) ADD HERE! To replace and fill css files
        .pipe(dest('./static/built/assets/css'))
    done()
}

function cssProd (done) {
	src('./static/assets/**/*.scss')
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
		.pipe(rcs()) // <-- ADD HERE! To replace and fill css files for prod
		.pipe(dest('./static/built/assets/css'))
	done()
}

function js (done) {
	src('./static/assets/**/*.js')
		.pipe(babel({
			presets: ['@babel/preset-env']
		}))
		.pipe(rcs()) // <-- (optional) ADD HERE! To replace filled css variables
		.pipe(dest('./static/built/assets/js'))
	done()
}

function jsProd (done) {
	src('./static/assets/**/*.js')
		.pipe(babel({
			presets: ['@babel/preset-env']
		}))
		.pipe(rcs()) // <-- ADD HERE! To replace css variables files for prod (be aware of the caveats)
		.pipe(dest('./static/built/assets/js'))
	done()
}

function html (done) {
	src('./static/**/*.html') // <-- this path might change depending on your structure, but I took it from the watch task
		.pipe(rcs()) // <-- ADD HERE! To replace css variables files for prod (be aware of the caveats)
		.pipe(dest('./static/built')) // <-- also this changes depending where your destination HTML files should be stored
	done()
}


function htmlProd (done) {
	src('./static/*.html') // <-- this path might change depending on your structure, but I took it from the watch task
		.pipe(rcs()) // <-- ADD HERE! To replace css variables files for prod (be aware of the caveats)
		// here you could add some more pipes for your HTML, maybe a minifier? -> https://github.com/alferov/awesome-gulp
		.pipe(dest('./static/built')) // <-- also this changes depending where your destination HTML files should be stored
	done()
}

function sync (done) {
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
    watch(['./static/**/*.js', './static/**/*.html', './static/**/*.css', 'tailwind.config.js']).on("change", browserSync.reload)
    done()
}

const cssWatcher = () => watch('./static/assets/**/*.scss', css)
const jsWatcher = () => watch('./static/assets/**/*.js', js)

const watchers = parallel(cssWatcher, jsWatcher)

exports.default = series(css, js, html, sync, watchers) // <-- do not forget to add html() here (anywhere after css and before sync
exports.build = series (cssProd, jsProd, htmlProd) // <-- also here add htmlProd()
