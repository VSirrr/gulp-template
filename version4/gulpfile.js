const { src, dest, series, parallel, watch, lastRun } = require("gulp");
const gulpLoadPlugins = require("gulp-load-plugins");
const del = require("del");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const browserSync = require("browser-sync");

const $ = gulpLoadPlugins();
const server = browserSync.create();
const port = 9000;

const isProd = process.env.NODE_ENV === "production";

function js() {
  return src("src/js/*.js")
    .pipe($.plumber())
    .pipe($.babel())
    .pipe($.if(isProd, $.uglify()))
    .pipe($.if(isProd, dest("dist/js"), dest(".tmp/js")))
    .pipe($.if(!isProd, server.reload({ stream: true })));
}

function lint() {
  return src("src/js/*.js")
    .pipe($.eslint({ fix: true }))
    .pipe($.eslint.format())
    .pipe($.if(!server.active, $.eslint.failAfterError()));
}

function css() {
  return src(["src/css/*.css", "src/css/*.less", "!src/css/_*.less"])
    .pipe($.plumber())
    .pipe($.less())
    .pipe(
      $.if(
        isProd,
        $.postcss([autoprefixer(), cssnano()]),
        $.postcss([autoprefixer()])
      )
    )
    .pipe($.if(isProd, dest("dist/css"), dest(".tmp/css")))
    .pipe($.if(!isProd, server.reload({ stream: true })));
}

function img() {
  return src("src/img/*", { since: lastRun(img) })
    .pipe($.imagemin())
    .pipe(dest("dist/img"));
}

function fonts() {
  return src("src/fonts/*.{eot,svg,ttf,woff,woff2}").pipe(dest("dist/fonts"));
}

function html() {
  return src("src/*.html").pipe(dest("dist"));
}

function lib() {
  return src("src/lib/*").pipe(dest("dist/lib"));
}

function clean() {
  return del([".tmp", "dist"]);
}

function devServer() {
  server.init({
    notify: false,
    port,
    server: {
      baseDir: [".tmp", "src"],
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });

  watch(["src/*.html", "src/img/*", "src/fonts/*", "src/lib/*"]).on(
    "change",
    server.reload
  );

  watch("src/js/*.js", js);
  watch(["src/css/*.css", "src/css/*.less"], css);
}

exports.default = series(clean, parallel(js, css), devServer);

exports.build = series(clean, parallel(lint, js, css, img, fonts, html, lib));
