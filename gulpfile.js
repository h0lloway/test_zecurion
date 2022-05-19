const { src, dest, parallel, series, watch } = require('gulp');

const sass = require('gulp-sass')(require('sass'));
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
// const fs = require('fs');
const del = require('del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const gulp = require('gulp');
const babel = require('gulp-babel')
const uglify = require('gulp-uglify-es').default;
// const gutil = require('gulp-util');
// const ftp = require('vinyl-ftp');


const fonts = () => {
  src('./src/fonts/**.ttf')
    .pipe(ttf2woff())
    .pipe(dest('./dev/fonts/'))
  return src('./src/fonts/**.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('./dev/fonts/'))
}

const svgSprites = () => {
  return src('./src/img/svg/**.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../sprite.svg"
        }
      }
    }))

    .pipe(dest('./dev/img'))
}

const styles = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())

    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', notify.onError()))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./dev/css/'))
    .pipe(browserSync.stream());
}

const htmlInclude = () => {
  return src(['./src/*.html'])
    .pipe(fileinclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(dest('./dev'))
    .pipe(browserSync.stream());
}

const imgToApp = () => {
  return src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg', './src/img/**.webp', './src/img/**.svg'])
    .pipe(dest('./dev/img'))
}

const resources = () => {
  return src('./src/resources/**')
    .pipe(dest('./dev'))
}

const clean = () => {
  return del(['dev/*'])
}

const scripts = () => {
  return src([
    './src/js/components/**/*.js',
    './src/js/main.js'
  ])
    // .pipe(sourcemaps.init())
    // .pipe(babel({
    //     presets: ['@babel/env']
    // }))
    // .pipe(concat('main.js'))
    .pipe(sourcemaps.write())
    .pipe(dest('./dev/js'))
    .pipe(browserSync.stream())
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./dev"
    }
  });


  watch('./src/scss/**/*.scss', styles);
  watch('./src/html/*.html', htmlInclude);
  watch('./src/*.html', htmlInclude);
  watch('./src/img/**.jpg', imgToApp);
  watch('./src/img/**.png', imgToApp);
  watch('./src/img/**.jpeg', imgToApp);
  watch('./src/img/**.webp', imgToApp);
  // watch('./src/img/**.svg', imgToApp);
  watch('./src/img/**.svg', svgSprites);
  watch('./src/resources/**', resources);
  // watch('./src/img/**.jpg,jpeg,png', webpImages);
  watch('./src/fonts/**.ttf', fonts);
  watch('./src/js/**/*.js', scripts);
  watch('./src/resources/**', resources);
}


exports.styles = styles;
exports.scripts = scripts
exports.watchFiles = watchFiles;
exports.fileinclude = htmlInclude;

exports.default = series(clean, parallel(htmlInclude, scripts, fonts, resources, imgToApp, svgSprites), styles, watchFiles);
// exports.default = series(clean, parallel(htmlInclude, scripts, fonts, resources, imgToApp), styles, watchFiles);

const fontsBuild = () => {
  src('./src/fonts/**.ttf')
    .pipe(ttf2woff())
    .pipe(dest('./build/fonts/'))
  return src('./src/fonts/**.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('./build/fonts/'))
}

const htmlIncludeBuild = () => {
  return src(['./src/*.html'])
    .pipe(fileinclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(dest('./build'))
}


const stylesBuild = () => {
  return src('./src/scss/**/*.scss')

    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', notify.onError()))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(dest('./build/css/'))
}


// const scriptsBuild = () => {
//   return src('./src/js/main.js')
//     .pipe(webpackStream({
//       mode: 'development',
//       output: {
//         filename: 'main.js',
//       },
//       module: {
//         rules: [{
//           test: /\.m?js$/,
//           exclude: /(node_modules|bower_components)/,
//           use: {
//             loader: 'babel-loader',
//             options: {
//               presets: ['@babel/preset-env']
//             }
//           }
//         }]
//       },
//     }))
//     .on('error', function (err) {
//       console.error('WEBPACK ERROR', err);
//       this.emit('end'); // Don't stop the rest of the task
//     })

//     .pipe(uglify().on("error", notify.onError()))
//     .pipe(dest('./app/js'))
// }

const scriptsBuild = () => {
  return src([
    './src/js/components/**/*.js',
    './src/js/main.js'
  ])
    // .pipe(babel({
    //     presets: ['@babel/env']
    // }))
    .pipe(dest('./build/js'))
}

const imgToAppBuild = () => {
  return src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg', './src/img/**.webp', './src/img/**.svg'])
    .pipe(dest('./build/img'))
}

const svgSpritesBuild = () => {
  return src('./src/img/svg/**.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../sprite.svg"
        }
      }
    }))
    .pipe(dest('./build/img'))
}


exports.build = series(clean, parallel(htmlIncludeBuild, scriptsBuild, fontsBuild, resources, imgToAppBuild, svgSpritesBuild), stylesBuild);
// exports.build = series(clean, parallel(htmlInclude, scriptsBuild, fonts, resources, imgToApp), stylesBuild);

// // deploy
// const deploy = () => {
// 	let conn = ftp.create({
// 		host: '',
// 		user: '',
// 		password: '',
// 		parallel: 10,
// 		log: gutil.log
// 	});

// 	let globs = [
// 		'app/**',
// 	];

// 	return src(globs, {
// 			base: './app',
// 			buffer: false
// 		})
// 		.pipe(conn.newer('')) // only upload newer files
// 		.pipe(conn.dest(''));
// }

// exports.deploy = deploy;
