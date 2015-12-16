'use strict';

// Exports
// -------
module.exports = angular.module('app.metadata', [])
  .factory('MetadataService', require('./metadata-service'));
