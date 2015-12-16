'use strict';

function Step1Service($http, $q, AppSettings) {
  return {
    create: function(data) {
      var deferred = $q.defer();
      var req = {
        method: 'POST',
        url: AppSettings.apiUrl + '/leads',
        data: data
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
module.exports = ['$http', '$q', 'AppSettings', Step1Service];
