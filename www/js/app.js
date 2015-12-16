'use strict';

// core dependencies
require('ionic');

// third-party plugins

// local modules
require('./templates');

angular.element(document).ready(function() {
  var requires = [
    'ionic',
    'templates'
  ];

  module.exports = angular.module('app', requires)
    .constant('AppSettings', require('./constants'))
    .config(['$ionicConfigProvider', function($ionicConfigProvider) {
      $ionicConfigProvider.navBar.alignTitle('center');
    }])
    .config(require('./router'))
    .run(require('./app-main'));

  angular.bootstrap(document, ['app']);
});
