'use strict';

// Exports
// -------
module.exports = angular.module('app.step1', [])
  .factory('Step1Service', require('./step1-service'))
  .controller('Step1Controller', require('./step1-controller'));
