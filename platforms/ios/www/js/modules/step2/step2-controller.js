'use strict';

function Step2Controller(metadata) {
  var self = this;
  var model = {};

  function getIndustries(searchText) {
    var filtered = [];
    if (searchText) {
      angular.forEach(metadata.company.industries, function(industry) {
        if (industry.text.toLowerCase().indexOf(searchText) >= 0) {
          filtered.push(industry);
        }
      });
    }

    return filtered;
  }

  function industryClicked(callback) {
    self.model.company.industry = callback.item.text;
  }

  function industryRemoved(callback) {
    self.model.company.industry = '';
  }

  angular.extend(this, {
    model: model,
    maxMonth: new Date(),
    errorMessages: metadata.errorMessages,
    registrars: metadata.company.registrars,
    getIndustries: getIndustries,
    industryClicked: industryClicked,
    industryRemoved: industryRemoved
  });
}

// Exports
// -------
module.exports = [
  'metadata',
  Step2Controller
];
