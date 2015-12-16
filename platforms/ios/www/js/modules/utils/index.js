'use strict';

// Exports
// -------
module.exports = angular.module('app.utils', [])
  .factory('LocalStorageService', require('./localstorage-service'))
  .factory('HelperService', require('./helper-service'));
