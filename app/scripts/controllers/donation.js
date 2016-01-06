'use strict';

/**
 * @ngdoc function
 * @name splcDonationApp.controller:DonationCtrl
 * @description
 * # DonationCtrl
 * Controller of the splcDonationApp
 */
angular.module('splcDonationApp')
  .controller('DonationController',
                ['$scope',
                 '$http',
                 '$location',
                 'donationLogger',
                 'ecardIdService',
                 'paypalService',
                 'guidService',
                 'donationBuilder',
                 'bbDonationService',

  function ($scope,
            $http,
            $location,
            donationLogger,
            ecardIdService,
            paypalService,
            guidService,
            donationBuilder,
            bbDonationService) {


    // Backend attributes
    //var designationId = "09ccef1b-97c6-455a-a793-42ab31888036";
    //var merchantAccountId = "c6de7f55-a953-4e64-b382-147268e9b25f";


    // Validate Routing numbers
    $scope.validateRouting = function(rtgNum) {
      var r = rtgNum.match(/^\s*([\d]{9})\s*$/);
      if (!r) {
        return false;
      } else {
        var weights = [3, 7, 1];
        var aba = r[1];
        var sum = 0;
        for (var i=0; i<9; ++i) {
          sum += aba.charAt(i) * weights[i % 3];
        }

        return (sum !== 0 && sum % 10 === 0);
      }
    };

    // BB Country Service
    var cs = new BLACKBAUD.api.CountryService({
      url: '//bbnc21027d.blackbaudhosting.com/'
    });

    // Set countries on form
    $scope.getCountries = function() {
      cs.getCountries(function(data) {
        var countrySelect = $('.country-select');
        for (var i = 0; i < data.length; i++) {
          if (data[i].Description === 'United States') {
            countrySelect.append('<option value="' + data[i].Id + '">' + data[i].Description + '</option>');
          } else {
            countrySelect.append('<option value="' + data[i].Id + '">' + data[i].Description + '</option>');
          }
        }
      });
    };

    // Set states based on country selected
    // defaults to United States
    $scope.getStates = function(newCountryId, selectElem) {
      var countryId = newCountryId || guidService.defaultCountryGuid;
      var stateSelect = '';
      if (selectElem) {
        stateSelect = selectElem.html('');
      } else {
        stateSelect = $('.state-select').html('');
      }

      cs.getStates(countryId, function(data) {
        for (var i = 0, j = data.length; i < j; i++) {
          stateSelect.append('<option value="' + data[i].Id + '">' + data[i].Description + '</option>');
        }
      });
    };

    // Get a new set of states if the country changes
    $scope.changeStates = function() {
      $('.country-select.first').on('change', function() {
        $scope.getStates($(this).val(), $('.state-select.first'));
      });

      $('.country-select.second').on('change', function() {
        $scope.getStates($(this).val(), $('.state-select.second'));
      });
    };


    $scope.processCCDonation = function(donor, gift) {
      var donation = donationBuilder.buildCCDonation(donor, gift);

      function successCallback(response) {
        var responseData = response.data;
        donationLogger.setDonation(responseData);
        window.location = responseData.BBSPCheckoutUri;
      }

      function errorCallback(response) {
        $location.path('/incomplete');
      }

      bbDonationService.createDonation(donation, successCallback, errorCallback);
    };

    $scope.processCCMonthlyDonation = function(donor, gift) {
      var donation = donationBuilder.buildCCMonthlyDonation(donor, gift);

      function successCallback(response) {
        var responseData = response.data;
        donationIdService.setDonationId(responseData.Donation.Id);
        window.location = responseData.BBSPCheckoutUri;
      }

      function errorCallback(response) {
        $location.path('/confirmation');
      }

      bbDonationService.createDonation(donation, successCallback, errorCallback);
    };

    $scope.processACHMonthlyDonation = function(donor, gift) {
      var donation = donationBuilder.buildACHMonthlyDonation(donor, gift);

      function successCallback(response) {
        var responseData = response.data;
        donationIdService.setDonationId(responseData.Donation.Id);
        $location.path('/confirmation');
      }

      function errorCallback(response) {
        $location.path('/confirmation');
      }

      bbDonationService.createDonation(donation, successCallback, errorCallback);
    };

    $scope.processPaypalDonation = function(donor, gift) {
      var donation = donationBuilder.buildPledgeDonation(donor, gift);

      paypalService.setPaypalDonor(donation);
      $location.path('/paypal');
    };

    $scope.processTributeDonation = function(donor, gift, notification, ecard) {
      var donation = donationBuilder.buildPledgeDonation(donor, gift, notification, ecard);

      function successCallback(response) {
        var responseData = response.data;
        donationIdService.setDonationId(responseData.Donation.Id);
        $location.path('/confirmation');
      }

      function errorCallback(response) {
        $location.path('/confirmation');
      }

      bbDonationService.createDonation(donation, successCallback, errorCallback);
    };

    $scope.init = function() {
      $scope.getCountries();
      $scope.getStates();
      $scope.changeStates();

      // Validate routing number
      $('[name="routing_number"]').keyup(function() {
        var is_valid = $scope.validateRouting($(this).val());
        if (is_valid) {
          $('.error.aba').hide();
        } else {
          $('.error.aba').show();
        }
      });
    };

    $scope.init();
}]);
