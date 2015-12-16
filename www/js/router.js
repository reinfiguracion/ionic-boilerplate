'use strict';

/* @ngInject */
function Router($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('welcome', {
    url: '/welcome',
    templateUrl: 'welcome.html'
  });

  $urlRouterProvider.otherwise('/welcome');
}

// Exports
// -------
module.exports = Router;
