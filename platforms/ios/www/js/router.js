'use strict';

function Router($stateProvider, $locationProvider, $urlRouterProvider) {
  // $locationProvider.html5Mode({
  //   enabled: true,
  //   requireBase: false
  // });

  $stateProvider
  .state('step1', {
    url: '/apply?type',
    templateUrl: 'js/modules/step1/step1.html',
    controller: 'Step1Controller',
    controllerAs: 'vm',
    resolve: {
      metadata: ['MetadataService', function(MetadataService) {
        return MetadataService.getAll();
      }],
      locations: ['MetadataService', function(MetadataService) {
        return MetadataService.getMetadata('locations?filter[attributes][1]=cityName');
      }]
    }
  })
  .state('step2', {
    url: '/info',
    controller: 'Step2Controller',
    controllerAs: 'vm',
    resolve: {
      metadata: ['MetadataService', function(MetadataService) {
        return MetadataService.getAll();
      }]
    }
  })
  .state('step3', {
    url: '/verify',
    templateUrl: 'js/modules/step3/step3.html',
    controller: 'Step3Controller',
    controllerAs: 'vm'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'js/modules/login/login.html',
    controller: 'LoginController',
    controllerAs: 'vm'
  });

  // $urlRouterProvider.otherwise('/apply');
}

// Exports
// -------
module.exports = [
  '$stateProvider',
  '$locationProvider',
  '$urlRouterProvider',
  Router
];
