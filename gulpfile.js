'use strict';

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    neat = require('node-neat').includePaths;

var production = false,
    paths = {
      app:     '',
      styles:  'assets/_scss/**/*.scss',
      scripts: 'assets/js/application/**/*.js',
      images:  'assets/img/**/*.{png,gif,jpg,jpeg,svg}',
    };

gulp.task('styles', function () {
  return gulp.src(paths.styles)
  .pipe($.sass({
      includePaths: ['styles'].concat(neat),
      outputStyle: 'nested',
      precision: 10
    }))
    // Save css
    .pipe(gulp.dest('assets/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('scripts', function () {
  return gulp.src(paths.scripts)
    .pipe($.concat('app.js'))
    .pipe(gulp.dest('assets/js'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('images', function () {
  return gulp.src(paths.images)
    .pipe($.imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: []
    }))
    .pipe(gulp.dest('assets/img'));
});

gulp.task('watch', function () {
  gulp.watch(paths.styles,  ['styles']);
  gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('browser-sync', ['styles', 'scripts'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [paths.app]
    }
  });
});

gulp.task('serve', function () {
  runSequence(['browser-sync', 'images', 'watch']);
});
