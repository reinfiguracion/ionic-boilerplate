'use strict';

function MetadataService($http, $q, AppSettings) {
  return {
    getAll: function() {
      var deferred = $q.defer();
      $http.get('js/modules/metadata/metadata.json')
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(err, status) {
          deferred.reject(err, status);
        });

      return deferred.promise;
    },

    getMetadata: function() {
      var meta = arguments[0] || 'locations';
      var deferred = $q.defer();
      var req = {
        method: 'GET',
        url: AppSettings.apiUrl + '/' + meta
      };
      $http(req)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(error, status) {
          deferred.reject(error, status);
        });

      return deferred.promise;
    }
  };
}

// Exports
// -------
module.exports = ['$http', '$q', 'AppSettings', MetadataService];
