const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const webpack = require('webpack'); 
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const svgmin = require('gulp-svgmin');
const sprite = require('gulp-svg-sprite');
const svgCss = require('gulp-svg-css-pseudo');

// автоматическое обновление страницы
function browsersync() {
	browserSync.init({
		server: {
			baseDir: "./app"
		}
	})
}

//очищение папки dist
function clearDist() {
	return del('./dist');
}

// сжатие изображений 
function images() {
	return src('./app/images/**/*.*')
	.pipe(imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.mozjpeg({quality: 75, progressive: true}),
		imagemin.optipng({optimizationLevel: 5}),
		imagemin.svgo({
			plugins: [
				{removeViewBox: true},
				{cleanupIDs: false}
			]
		})
	]
	))
	.pipe(dest('./dist/images'))
}

function svg_css() {
  return src('./app/images/svg/**/*.svg')
    .pipe(svgmin({
      multipass: true,
      full: true,
      plugins: [
        'removeComments',
        'removeEmptyContainers'
      ]
    }))
    .pipe(svgCss({
      fileName: '_svg',
      fileExt: 'scss',
      cssPrefix: '$svg__',
      addSize: false
    }))
    .pipe(dest('./app/scss'))
}

// scss -> css и сжатие css
function styles() {
    return src('./app/scss/style.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(concat('style.min.css'))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 8 version'], 
			grid: true, 
			browsers: [
				'Android >= 4',
				'Chrome >= 20',
				'Firefox >= 24',
				'Explorer >= 11',
				'iOS >= 6',
				'Opera >= 12',
				'Safari >= 6',
			]
		}))
		.pipe(cleanCSS({
			level: 2
		}))
    .pipe(sourcemaps.write('../maps'))
		.pipe(dest('./app/css'))
		.pipe(browserSync.stream())
}

// работа с модулями js и их сжатие
function scripts() {
	return src('./app/js/modules/main.js')
		.pipe(webpackStream(webpackConfig), webpack)
		.pipe(dest('./app/js'))
		.pipe(browserSync.stream())
}

//импорт готовых файлов в dist
function build() {
	return src([
		'./app/css/*.css',
		'./app/fonts/**/*.*',
		'./app/js/*.js',
		'./app/*.html'
	], {base: './app'})
		.pipe(dest('./dist'))
}

// сжатие svg и создание спрайта
function svgSprite() {
  return src('./app/images/svg/**/*.svg')
    .pipe(svgmin({
      multipass: true,
      full: true,
      plugins: [
        'removeComments',
        'removeEmptyContainers'
      ]
    }))
    .pipe(sprite({
      mode: {
        symbol: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('app/images'))
    .pipe(browserSync.stream())
}

// слежка за файлами и их обновление
function watching() {
	watch(['./app/scss/**/*.scss'], styles);
	watch(['./app/js/modules/**/*.js'], scripts);
  watch(['./app/images/svg'], svgSprite);
	watch(['./app/*.html']).on('change', browserSync.reload);
}


exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.clearDist = clearDist;
exports.svgSprite = svgSprite;
exports.svg_css = svg_css;

exports.build = series( 
  clearDist, 
  parallel(images, styles, scripts),
  build
  );

exports.default = parallel(styles, scripts, svgSprite, browsersync, watching);