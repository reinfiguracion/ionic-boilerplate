'use strict';

/**
 * @ngInject
 */
function AppMain($ionicPlatform, $window, $ionicLoading, $rootScope, $state, $timeout, $ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if ($window.cordova && $window.cordova.plugins && $window.cordova.plugins.Keyboard) {
      $window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      $window.cordova.plugins.Keyboard.disableScroll(true);
    }
    if ($window.StatusBar) {
      // org.apache.cordova.statusbar required
      $window.StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$stateChangeStart', function(event) {
    // show loading
    $ionicLoading.show({
      template: 'Please wait...'
    });
  });

  $rootScope.$on('$stateChangeSuccess', function() {
    // hide loading
    $ionicLoading.hide();
  });

  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    var redirectToState = '';
    event.preventDefault();

    if (fromState.name) {
      if (error && error.statusCode === 401) {
        redirectToState = 'login';
      } else {
        redirectToState = fromState.name;
      }
    } else {
      redirectToState = 'welcome';
    }

    // redirect to state
    $timeout(function() {
      $state.go(redirectToState);
    });

    // hide loading
    $ionicLoading.hide();

    // show error
    $ionicPopup.alert({
      title: error.statusCode === 401 ? error.error : 'Oops...',
      template: error.statusCode === 401 ? error.message : 'There was an error processing your request.',
      okType: 'button-balanced'
    });
  });
}

// Exports
// -------
module.exports = AppMain;
