'use strict';

var config = require('../config');
var changed = require('gulp-changed');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync');

gulp.task('images', function() {
  return gulp.src(config.images.src)
    .pipe(changed(config.images.dest))
    .pipe(gulpif(global.isProd, imagemin()))
    .pipe(gulp.dest(config.images.dest))
    .pipe(browserSync.stream({
      once: true
    }));
});
