'use strict';

var config = require('../config');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var streamify = require('gulp-streamify');
var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var handleErrors = require('../util/handle-errors');
var browserSync = require('browser-sync');
var debowerify = require('debowerify');
var ngAnnotate = require('browserify-ngannotate');

function buildScript(file) {
  var bundler = browserify({
    entries: [config.sourceDir + 'js/' + file],
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: !global.isProd
  });

  if (!global.isProd) {
    bundler = watchify(bundler);

    bundler.on('update', function() {
      rebundle();
      gutil.log('Rebundle...');
    });
  }

  var transforms = [
    {name: babelify, options: {}},
    {name: debowerify, options: {}},
    {name: ngAnnotate, options: {}},
    {name: 'brfs', options: {}},
    {name: 'bulkify', options: {}}
  ];

  transforms.forEach(function(transform) {
    bundler.transform(transform.name, transform.options);
  });

  function rebundle() {
    var stream = bundler.bundle();
    var createSourceMap = global.isProd && config.browserify.prodSourcemap;

    return stream.on('error', handleErrors)
      .pipe(source(file))
      .pipe(gulpif(createSourceMap, buffer()))
      .pipe(gulpif(createSourceMap, sourcemaps.init()))
      .pipe(gulpif(global.isProd, streamify(uglify({
        compress: {
          drop_console: true
        }
      }))))
      .pipe(gulpif(createSourceMap, sourcemaps.write('./')))
      .pipe(gulp.dest(config.scripts.dest))
      .pipe(browserSync.stream({
        once: true
      }));
  }

  return rebundle();
}

gulp.task('browserify', function() {
  return buildScript('app.js')
});
