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
                 'donationIdService', 
                 'ecardIdService', 
                 'paypalService',
                 'guidService',
                 'donationBuilder',
                 'bbDonationService',
                 
  function ($scope, 
            $http, 
            $location, 
            donationIdService, 
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
    }

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
            countrySelect.append('<option selected="selected" value="' + data[i].Id + '">' + data[i].Description + '</option>');
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
      if (selectElem) {
        var stateSelect = selectElem.html('');
      } else {
        var stateSelect = $('.state-select').html('');
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


    // Send the donation to BB
    $scope.processDonation = function(donation) {
     $http({
        method: 'POST',
        url: 'https://bbnc21027d.blackbaudhosting.com/WebApi/1128/Donation/Create',
        data: donation,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function successCallback(response) {
        var responseData = response.data;
        if (donation.Gift.PaymentMethod == 1) {
          // Log the donationId in shared service for later use
          donationIdService.setDonationId(responseData.Donation.Id);
          // Send to confirmation page
          console.log(response);
          //$location.path('/confirmation');
        } else {
          // Otherwise send user to BB payment page to pay with cc
          window.location = responseData.BBSPCheckoutUri;
        }
      }, function errorCallback(response) {
        console.log(response);
          //$location.path('/confirmation');
      }); 
    };

    // Create a new donation once the form has been validated
    $scope.buildDonation = function(donor, gift, notification, ecard) {

      // Set the donation amount
      var donationAmount = gift.Designations.Amount == 'other' ?
                           gift.OtherAmount :
                           gift.Designations.Amount;

      // Declare donation object
      var donation = {};
      // Build the donor
      donation.Donor = donor;
      // Build the gift 
      donation.Gift = {};
      donation.Gift.Designations = [{
        "Amount": donationAmount,
        "DesignationId": guidService.designationGuid,
      }];
        
      // Default payment method to 0 if no payment method sent
      if (gift.PaymentMethod) {
        donation.Gift.PaymentMethod = parseInt(gift.PaymentMethod);

        // If the payment method is ach capture the account info
        if (donation.Gift.PaymentMethod == 1) {
          donation.Gift.Attributes = [];
          donation.Gift.Attributes.push(
            { AttributeId: 1, value: gift.Routing  },
            { AttributeId: 2, value: gift.AccountNumber },
            { AttributeId: 3, value: gift.AccountHolder }
          );
        }
      } else if (donation.Gift.PaymentMethod == 2) {
          // Were sending a pledge if it's paypal
          donation.Gift.PaymentMethod = 1;
      } else {
          // Default payment method is credit card
          donation.Gift.PaymentMethod = 0; 
      }

      // Set the confirmation url and return url
      // Only if the payment method is credit card
      if (donation.Gift.PaymentMethod == 0) {
        donation.BBSPReturnUri = window.location.origin + '/#/confirmation';
      }

      donation.MerchantAccountId = merchantAccountId;

      // Determine if the gift is a tribute
      if (notification && notification.Type == 'email') {
        // Set the ecard type in the ecardIdService
        ecardIdService.setEcardId(ecard.Type);

        donation.Gift.Tribute = {};
        donation.Gift.Tribute.TributeDefinition = {};
        donation.Gift.Tribute.TributeDefinition = gift.Tribute.TributeDefinition;
        donation.Gift.Tribute.TributeDefinition.Type = gift.Tribute.TributeDefinition.Type;
        donation.Gift.Tribute.TributeDefinition.Description =  gift.Tribute.TributeDefinition.Type;

        donation.Gift.Tribute.Acknowledgee = {};
        donation.Gift.Tribute.Acknowledgee = gift.Tribute.Acknowledgee;

        donation.Gift.Comments = gift.Comments;
      }
      
      // If the gift is a recurring donation 
      if (gift.Recurrence && gift.Recurrence.Frequency == '2') {
        donation.Gift.Recurrence = {};
        // Set recurrence to today
        var today = new Date();
        donation.Gift.Recurrence.DayOfMonth = today.getDate(); // Set day of month
        donation.Gift.Recurrence.Frequency = parseInt(gift.Recurrence.Frequency); // Frequency is 2
        donation.Gift.Recurrence.StartDate = today;
      }

      // Send donation to BB
      if (gift.PaymentMethod == '2') {
        // set the payment type to pledge
        donation.Gift.PaymentMethod = 1;
        paypalService.setPaypalDonor(donation);
        $location.path('/paypal');
      } else {
        $scope.processDonation(donation);
      }

    };

    $scope.processCCDonation = function(donor, gift) {
      var donation = donationBuilder.buildCCDonation(donor, gift); 

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

    $scope.processCCRecurringDonation = function(donor, gift) {
      var donation = donationBuilder.buildCCRecurringDonation(donor, gift);
      console.log(donation);
    }

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
