'use strict';

/**
 * @ngdoc function
 * @name splcDonationApp.controller:DonationCtrl
 * @description
 * # DonationCtrl
 * Controller of the splcDonationApp
 */
angular.module('splcDonationApp')
  .controller('DonationController', ['$scope', '$http', function ($scope, $http) {

    /*var ds = new BLACKBAUD.api.DonationService(
      1117, {
        url: '//bbnc21027d.blackbaudhosting.com/'
      }
    );*/

    var cs = new BLACKBAUD.api.CountryService({
      url: '//bbnc21027d.blackbaudhosting.com/'
    });

    $scope.logger = function(thing) {
      console.log(thing);
    };

    // Set countries on form
    $scope.getCountries = function() {
      cs.getCountries(function(data) {
        var countrySelect = $('.country-select');
        for (var i = 0; i < data.length; i++) {
          if (data[i].Description === 'United States') {
            countrySelect.append('<option selected="selected" value="' + data[i].Id + '">' + data[i].Description + '</option>');
          } else {
            countrySelect.append('<option value="' + data[i].Id + '">' + data[i].Description + '</option>');
          }
        }
      });
    };

    // Set states based on country selected
    // defaults to United States
    $scope.getStates = function(newCountryId) {
      var countryId = newCountryId || "d81cef85-7569-4b2e-8f2e-f7cf998a3342";
      var stateSelect = $('.state-select').html('');
      cs.getStates(countryId, function(data) {
        for (var i = 0, j = data.length; i < j; i++) {
          stateSelect.append('<option value="' + data[i].Id + '">' + data[i].Description + '</option>');
        }
      });
    };

    // Get a new set of states if the country changes
    $scope.changeStates = function() {
      $('.country-select').on('change', function() {
        $scope.getStates($(this).val());
      });
    };

    // Create a new donation once the form has been validated
    $scope.createDonation = function(donor, gift) {
    
      var donationAmount = gift.Designations.Amount == 'other' ? 
                           gift.OtherAmount : 
                           gift.Designations.Amount;
      
      var donation = {
        "Donor": {
          "Title": '',
          "FirstName": donor.FirstName,
          "LastName": donor.LastName,
          "EmailAddress": donor.EmailAddress,
          "Phone": donor.Phone,
          "Address": {
            "StreetAddress": donor.Address.StreetAddress,
            "City": donor.Address.City,
            "State": donor.Address.State,
            "Country": donor.Address.Country,
            "PostalCode": donor.Address.PostalCode,
          }
        },
        "Gift": {
          "Designations": [
            {
              "Amount": donationAmount,
              "DesignationId": "09ccef1b-97c6-455a-a793-42ab31888036",
            }
          ],
        },
        "BBSPReturnUri": window.location.href + 'confirmation',
        "MerchantAccountId": "c6de7f55-a953-4e64-b382-147268e9b25f",
      }; // end donation 

      $http({
        method: 'POST',
        url: '//bbnc21027d.blackbaudhosting.com/WebApi/1128/Donation/Create',
        data: donation,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function successCallback(response) {
        //console.log(response);
        //var returnedDonation = response.data;
        //console.log(returnedDonation);
        window.location = returnedDonation.BBSPCheckoutUri; 
      }, function errorCallback(response) {
        console.log(response);
      });

    };

    $scope.init = function() {
      $scope.getCountries();
      $scope.getStates();
      $scope.changeStates();
      //$scope.createDonation();
    };

    $scope.init();
}]);
