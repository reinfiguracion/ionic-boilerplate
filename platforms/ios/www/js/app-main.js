'use strict';

function AppMain($ionicPlatform, $rootScope, $state, LocalStorageService, HelperService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$stateChangeStart', function(event, toState) {
    var leadInfo = LocalStorageService.getObject('leadInfo');
    if (toState.name === 'step2' && leadInfo) {
      var template = HelperService.getStep2Template();
      toState.templateUrl = 'js/modules/step2/' + template;
    }
  });
}

// Exports
// -------
module.exports = [
  '$ionicPlatform',
  '$rootScope',
  '$state',
  'LocalStorageService',
  'HelperService',
  AppMain
];
