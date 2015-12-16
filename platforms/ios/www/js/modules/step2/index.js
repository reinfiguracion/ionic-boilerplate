'use strict';

// Exports
// -------
module.exports = angular.module('app.step2', [])
  .factory('Step2Service', require('./step2-service'))
  .controller('Step2Controller', require('./step2-controller'));
