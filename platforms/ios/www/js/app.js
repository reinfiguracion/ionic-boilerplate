'use strict';

require('angular-messages');
require('ionAutocomplete');
require('ionicWizard');
require('./modules/utils');
require('./modules/metadata');
require('./modules/step1');
require('./modules/step2');
require('./modules/step3');
require('./modules/login');

angular.element(document).ready(function() {
  var requires= [
    'ionic',
    'ion-autocomplete',
    'ionic.wizard',
    'ngMessages',
    'app.utils',
    'app.metadata',
    'app.step1',
    'app.step2',
    'app.step3',
    'app.login'
  ];

  module.exports = angular.module('app', requires)
    .constant('AppSettings', require('./constants'))
    .config(require('./router'))
    .run(require('./app-main'));

  angular.bootstrap(document, ['app']);
});
