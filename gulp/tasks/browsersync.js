'use strict';

var config = require('../config');
var url = require('url');
var browserSync = require('browser-sync');
var gulp = require('gulp');

gulp.task('browserSync', function() {
  var DEFAULT_FILE = 'index.html';
  var ASSET_EXTENSION_REGEX = new RegExp(/\b(?!\?)\.(js|css|png|jpe?g|gif|svg|eot|otf|ttc|ttf|woff2?)(?!\.)/i);

  browserSync.init({
    server: {
      baseDir: config.buildDir,
      middleware: function(req, res, next) {
        var fileHref = url.parse(req.url).href;

        if ( !ASSET_EXTENSION_REGEX.test(fileHref) ) {
          req.url = '/' + DEFAULT_FILE;
        }

        return next();
      }
    },
    port: config.browserPort,
    ui: {
      port: config.UIPort
    },
    ghostMode: {
      links: false
    }
  });
});
