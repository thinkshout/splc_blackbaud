'use strict';

/**
 * @ngdoc function
 * @name splcDonationApp.controller:DonationCtrl
 * @description
 * # DonationCtrl
 * Controller of the splcDonationApp
 */
angular.module('splcDonationApp')
  .controller('DonationController', ['$scope', '$http', 'donationIdService', 'ecardIdService', function ($scope, $http, donationIdService, ecardIdService) {

    // BB Country Service
    var cs = new BLACKBAUD.api.CountryService({
      url: '//bbnc21027d.blackbaudhosting.com/'
    });

    // Donation service
    var dOpts = {
      url: '//bbnc21027d.blackbaudhosting.com/',
      crossDomain: true
    };
    var ds = new BLACKBAUD.api.DonationService('1128', dOpts);

    var designationId = "09ccef1b-97c6-455a-a793-42ab31888036";
    var merchantAccountId = "c6de7f55-a953-4e64-b382-147268e9b25f";

     
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
      var countryId = newCountryId || "d81cef85-7569-4b2e-8f2e-f7cf998a3342";
      if (selectElem) {
        var stateSelect = selectElem.html('');
        console.log(stateSelect);
      } else {
        var stateSelect = $('.state-select').html('');
        console.log(stateSelect);
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
      
      var success = function(response) {
        //var responseData = response.data;
        console.log(response);
      };

      var failure = function(response) {
        console.log(response);
      };

      ds.createDonation(donation, success, failure);

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
        "DesignationId": designationId,
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

          /*donation.Origin = 'Routing:'+gift.Routing +
                            ' AccountNumber:'+gift.SourceCode.AccountNumber +  
                            ' AccountHolder:'+gift.SourceCode.AccountHolder; */

        }
      } else {
        donation.Gift.PaymentMethod = 0;
      }

      //donation.Gift.PaymentMethod = 1;


      // Set the confirmation url and return url
      // Only if the payment method is credit card
      if (donation.Gift.PaymentMethod == 0) {
        donation.BBSPReturnUri = window.location.href + 'confirmation';
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

      console.log(donation);
      // Send donation to BB
      $scope.processDonation(donation);
    };

    $scope.init = function() {
      $scope.getCountries();
      $scope.getStates();
      $scope.changeStates();

      $('[name="routing_number"]').keyup(function() {
        //console.log($(this).val());
        var is_valid = $scope.validateRouting($(this).val());
        //console.log( $scope.validateRouting($(['name="routing_number"']).val() );
        if (is_valid) {
          $('.error.aba').hide();
        } else {
          $('.error.aba').show();
        }
      });    
    };

    $scope.init();
}]);
