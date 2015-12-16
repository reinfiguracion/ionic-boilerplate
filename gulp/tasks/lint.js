'use strict';

var config  = require('../config');
var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('lint', function() {
  return gulp.src([config.scripts.src, '!www/js/templates.js'])
    .pipe(eslint({
      quiet: true
    }))
    .pipe(eslint.format());
});
