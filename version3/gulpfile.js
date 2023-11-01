// gulp主文件，用于注册任务
'use strict';
// 引入模块
const gulp = require('gulp'); //gulp
const del = require('del'); //del删除文件
const sass = require('gulp-sass'); //sass->css
const uglify = require('gulp-uglify'); //压缩js
const htmlmin = require('gulp-htmlmin'); //压缩html
const postcss = require('gulp-postcss'); // postcss
const autoprefixer = require('autoprefixer'); // 自动添加浏览器前缀
const cssnano = require('cssnano'); // 压缩css
const imagemin = require('gulp-imagemin'); //压缩图片
const rename = require('gulp-rename'); //文件重命名
const connect = require('gulp-connect'); //开启服务,同步更新
const open = require('open'); //打开浏览器
// const concat = require('concat'); //合并文件
// const rev = require('gulp-rev'); //版本控制--添加 hash
// const revCollector = require('gulp-rev-collector'); //版本控制--替换 html中引入的文件名加上 hash

const DIST = 'dist/';

// 删除已有的 dist 文件夹
gulp.task('del', function () {
  return del(DIST);
});

// html 复制 压缩
gulp.task('html', function () {
  return gulp
    .src('src/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest(DIST))
    .pipe(connect.reload());
});
// 复制图片
gulp.task('img', function () {
  return gulp
    .src('src/img/**/*.*')
    .pipe(imagemin())
    .pipe(gulp.dest(DIST + 'img'))
    .pipe(connect.reload());
});
// 复制字体
gulp.task('font', function () {
  return gulp.src('src/font/**/*.*')
    .pipe(gulp.dest(DIST + 'font'))
});
// 复制lib
gulp.task('lib', function () {
  return gulp.src('src/lib/**/*.*')
    .pipe(gulp.dest(DIST + 'lib'))
});
// js合并 压缩混淆 (src/js/**/*.js 深度文件查找)
gulp.task('js', function () {
  return gulp
    .src('src/js/**/*.js')
    .pipe(gulp.dest(DIST + 'js')) //生成文件
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(DIST + 'js'))
    .pipe(connect.reload());
});
// sass编译 压缩 --合并没有必要，一般预处理css都可以倒包
gulp.task('sass', function () {
  return gulp
    .src('src/css/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/css'))
});
// postcss处理，添加浏览器私有前缀并压缩代码
gulp.task('css', ['sass'], function () {
  const processors = [
    autoprefixer({
      browsers: [
        "> 1%",
        "last 2 versions",
        "not ie < 8"
      ]
    }),
    cssnano
  ]

  return gulp.src('src/css/*.css')
    .pipe(gulp.dest(DIST + 'css'))
    .pipe(postcss(processors))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(DIST + 'css'))
    .pipe(connect.reload());
});

//注册任务,实时刷新
gulp.task('dev', [
  'css', 'js', 'img', 'html', 'lib', 'font'
], function () {
  connect.server({
    root: 'dist', //文件路径
    livereload: true, //实时刷新
    port: 5000 //端口
  });
  //打开浏览器
  open('http://localhost:5000');
  //监听文件的改变
  gulp.watch([
    'src/css/**/*.scss', 'src/css/**/*.css'
  ], ['css']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/img/**/*.*', ['img']);
  gulp.watch('src/**/*.html', ['html']);
});

//打包
gulp.task('build', ['css', 'js', 'img', 'html', 'lib', 'font'])