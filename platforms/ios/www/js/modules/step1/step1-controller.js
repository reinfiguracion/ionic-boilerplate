'use strict';

function Step1Controller(metadata, locations, Step1Service, LocalStorageService, $ionicLoading, $ionicPopup, $state, $filter) {
  var self = this;
  var validLoanTypes = metadata.loan.types;
  var type = $state.params.type;
  var loanType = type && validLoanTypes.indexOf(type.toLowerCase()) !== -1 ? type : 'personal';

  var model = {
    applications: [
      { type: loanType }
    ]
  };

  function apply() {
    $ionicLoading.show({
      template: 'Processing...'
    });

    Step1Service.create(self.model)
    .then(function(response) {
      LocalStorageService.setObject('leadInfo', response);
      $state.go('step2');
    })
    .catch(function(err) {
      var leadInfo = err.leadInfo;
      if (err.statusCode === 409) {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Hi ' + leadInfo.profile.firstname + '!',
          template: [
            'We found out that you have an existing ',
            '<strong>' + leadInfo.application.type + ' loan</strong> application ',
            'using the same email address or mobile number that you provided. ',
            'Do you want to proceed to the next step?'
          ].join(''),
          cancelText: 'No',
          okText: 'Yes'
        });
        confirmPopup.then(function(res) {
          if (res) {
            switch (leadInfo.status) {
              case '1':
                LocalStorageService.setObject('leadInfo', leadInfo);
                $state.go('step2');
                break;
              case '2':
                LocalStorageService.setObject('leadInfo', leadInfo);
                //$state.go('step3');
                break;
              default:
                //$state.go('login');
            }
          }
        });
      } else {
        $ionicPopup.alert({
         title: 'Oops...',
         template: 'There was an error processing your request.'
        });
      }
    })
    .finally(function() {
      $ionicLoading.hide();
    });
  }

  function getLocations(searchText) {
    var filtered = [];
    if (searchText) {
      angular.forEach(locations, function(location) {
        if (location.cityName.toLowerCase().indexOf(searchText) >= 0) {
          filtered.push(location);
        }
      });
    }

    return filtered;
  }

  function itemsClicked(callback) {
    self.model.profile.address = callback.item.cityName;
  }

  function itemsRemoved(callback) {
    self.model.profile.address = '';
  }

  angular.extend(this, {
    apply: apply,
    model: model,
    errorMessages: metadata.errorMessages,
    getLocations: getLocations,
    incomeSources: metadata.incomeSources,
    itemsClicked: itemsClicked,
    itemsRemoved: itemsRemoved
  });
}

// Exports
// -------
module.exports = [
  'metadata',
  'locations',
  'Step1Service',
  'LocalStorageService',
  '$ionicLoading',
  '$ionicPopup',
  '$state',
  '$filter',
  Step1Controller
];
