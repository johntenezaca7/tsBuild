// Init Modules
const { series, parallel, src, dest, watch } = require("gulp");
const replace = require("gulp-replace");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass");
const webpackStream = require("webpack-stream");
const webpackConfig = require("./webpack.config");
var browserSync = require('browser-sync').create();

// File Path Variables
const files = {
  source: {
    scssPath: "./src/scss/main.scss",
    jsPath: "./src/js/**/*.js",
    tsPath: "./src/ts/**/*.(ts + tsx)",
    htmlPath: "./public/index.html"
  },
  public: {
    cssPath: "./public/css/",
    jsPath: "./public/js/",
    htmlPath: "./public/"
  },
  watch: {
    scss: "./src/scss/**/*.scss",
    ts: "./src/ts/**/*.tsx",
    js: "./src/js/**/*.js"
  }
}

// BrowserSync Dev Server

function browsersync() {
  browserSync.init({
    injectChanges: true,
    server: {
      baseDir: "public"
    }
  });
}

// Sass Task
function scssTask() {
  return src( files.source.scssPath )
    .pipe( sass() )
    .pipe( dest( files.public.cssPath ));
}

// JS Task
function jsTask() {
  return src( files.source.jsPath )
    .pipe( concat("main.js") )
    .pipe( uglify() )
    .pipe( dest( files.public.jsPath ));
}

// TS Task 
function tsTask() {
  return src( files.source.tsPath)
    .pipe( webpackStream( webpackConfig ))
    .pipe( uglify() )
    .pipe( dest( files.public.jsPath ));
}

// Cachebusting Task
const cbString = new Date().getTime();

function cacheBustTask() {
  return src( files.source.htmlPath )
    .pipe( replace( /cb=\d+/g, "cb=" + cbString ))
    .pipe( dest( files.public.htmlPath ));
}

// Watch Task
function watchTask() {
  // Init browser-sync
  browsersync();

  // Watch files
  watch( [ files.watch.scss, files.watch.js ] ,
    parallel( scssTask, jsTask )).on('change', browserSync.reload);
}

// Default Task
// You can compile JS or TS 
exports.default = series(
  parallel( scssTask, jsTask ),
  cacheBustTask,
  watchTask
);