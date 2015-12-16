'use strict';

module.exports = {
  browserPort: 3000,
  UIPort: 3001,

  sourceDir: './www/',
  buildDir: './build/',

  styles: {
    src: 'scss/**/*.scss',
    dest: 'build/css',
    prodSourcemap: false,
    sassIncludePaths: ['./node_modules/ionic/scss']
  },

  data: {
    src: ['www/data/**/*'],
    dest: 'build/data'
  },

  scripts: {
    src: 'www/js/**/*.js',
    dest: 'build/js'
  },

  images: {
    src: 'www/img/**/*',
    dest: 'build/img'
  },

  fonts: {
    src: ['./node_modules/ionic/fonts/**/*'],
    dest: 'build/fonts'
  },

  views: {
    index: 'www/index.html',
    src: 'www/views/**/*.html',
    dest: 'www/js'
  },

  gzip: {
    src: 'build/**/*.{html,xml,json,css,js,js.map,css.map}',
    dest: 'build/',
    options: {}
  },

  dist: {
    root: 'build'
  },

  browserify: {
    bundleName: 'main.js',
    prodSourcemap: true
  },

  init: function() {
    this.views.watch = [
      this.views.index,
      this.views.src
    ];
    return this;
  }
}.init();
