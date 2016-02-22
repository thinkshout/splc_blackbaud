'use strict';

/**
 * @ngdoc overview
 * @name splcDonationApp
 * @description
 * # splcDonationApp
 *
 * Main module of the application.
 */
angular
  .module('splcDonationApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'validation.match',
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/donation.html',
        controller: 'DonationController',
        controllerAs: 'donation'
      })
      .when('/tribute', {
        templateUrl: 'views/tribute.html',
        controller: 'DonationController',
        controllerAs: 'donation'
      })
      .when('/confirmation', {
        templateUrl: 'views/confirmation.html',
        controller: 'ConfirmationController',
        controllerAs: 'confirmation'
      })
      .when('/ccconfirm', {
        templateUrl: 'views/confirmation.html',
        controller: 'CCConfirmController'
      })
      .when('/incomplete', {
        templateUrl: 'views/incomplete.html',
      })
      .when('/paypal', {
        templateUrl: 'views/paypal.html',
        controller: 'PaypalController',
        controllerAs: 'paypal'
      })
      .otherwise({
        redirectTo: '/'
      });
  }).config(function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
}).service('donationLogger', function () {
      var donation = {};

      return {
          getDonation: function () {
              return donation;
          },
          setDonation: function(donationObj, type) {
              donation = donationObj;
              donation.DonationType = type;
          }
      };
  }).service('ecardIdService', function () {
      var ecardId = '';

      return {
        getEcardId: function () {
          return ecardId;
        },
        setEcardId: function(value) {
          var ecardId = value;
        }
      };
  }).service('paypalService', function() {
      var paypalDonor = {};
      return {
        getPaypalDonor: function() {
          return paypalDonor;
        },
        setPaypalDonor: function(donation) {
          paypalDonor = donation;
        }
      };
  }).service('guidService', function() {
      return {
          // Blackbaud account info
          designationGuid:     "09ccef1b-97c6-455a-a793-42ab31888036",
          merchantAccountGuid: "c6de7f55-a953-4e64-b382-147268e9b25f",

          // Default to US for Country Service
          defaultCountryGuid:  "d81cef85-7569-4b2e-8f2e-f7cf998a3342",

          // Monthly payment or renewal?
          monthlyGuid:      "4E1FB9C5-E3D8-4EDE-8BE0-E48D16ABF3FD",
          renewalGuid:      "EF465D68-7F83-4984-8020-02F1-62C50206",

          // ACH info
          accountHolderGuid:   "39062A66-260D-4351-A0FC-41D57061C482",
          accountNumberGuid:   "C56B2DD2-0C58-4F49-8308-2F46428F699D",
          routingNumberGuid:   "A6C7CFA0-5686-45B3-A85C-D5A3E1E4A6AC",
      };
  }).service('donationBuilder', function(guidService) {
      var donation                   = {};
      donation.Gift                  = {};
      donation.Gift.Designations     = [];
      donation.MerchantAccountId     = guidService.merchantAccountGuid;

      return {
        // Build credit card donation
        buildCCDonation: function(donor, gift) {
          donation.Donor                 = donor;
          donation.Gift.PaymentMethod    = parseInt(gift.PaymentMethod);
          donation.BBSPReturnUri         = window.location.origin + '/#/confirmation';

          // Add payment amount + designation ID
          if (gift.Designations.Amount == 'other')
            donation.Gift.Designations.push({DesignationId: guidService.designationGuid, Amount: parseFloat(gift.OtherAmount).toFixed(2)});
          else
            donation.Gift.Designations.push({DesignationId: guidService.designationGuid, Amount: parseFloat(gift.Designations.Amount).toFixed(2)});

          return donation;
        },

        // Build cc recurring donation
        buildCCMonthlyDonation: function(donor, gift) {
          donation.Donor                 = donor;
          donation.Gift.PaymentMethod    = parseInt(gift.PaymentMethod);
          donation.BBSPReturnUri         = window.location.origin + '/#/confirmation';

          // Add payment amount + designation ID
          if (gift.Designations.Amount == 'other')
            donation.Gift.Designations.push({DesignationId: guidService.designationGuid, Amount: parseFloat(gift.OtherAmount).toFixed(2)});
          else
            donation.Gift.Designations.push({DesignationId: guidService.designationGuid, Amount: parseFloat(gift.Designations.Amount).toFixed(2)});

          var recurrenceType = gift.Recurrence.Frequency;
          var recurrenceAttribute = '';
          recurrenceType == 'monthly' ?
            recurrenceAttribute = guidService.monthlyGuid :
            recurrenceAttribute = guidService.renewalGuid;

          donation.Gift.Attributes = [
            { attributeId: recurrenceAttribute,     value: 'yes'              },
          ];

          return donation;
        },

        // Build ach recurring donation
        buildACHMonthlyDonation: function(donor, gift) {
          donation.Donor                 = donor;
          donation.Gift.PaymentMethod    = 1;

          // Add payment amount + designation ID
          if (gift.Designations.Amount == 'other')
            donation.Gift.Designations.push({DesignationId: guidService.designationGuid, Amount: parseFloat(gift.OtherAmount).toFixed(2)});
          else
            donation.Gift.Designations.push({DesignationId: guidService.designationGuid, Amount: parseFloat(gift.Designations.Amount).toFixed(2)});

          // Set recurrence type
          var recurrenceType = gift.Recurrence.Frequency;
          var recurrenceAttribute = '';
          recurrenceType == 'monthly' ?
            recurrenceAttribute = guidService.monthlyGuid :
            recurrenceAttribute = guidService.renewalGuid;

          // Commented out until issue resolved with attributes
          donation.Gift.Attributes = [
            { AttributeId: recurrenceAttribute,            Value: 'yes'              },
            { AttributeId: guidService.routingNumberGuid,  Value: gift.Routing       },
            { AttributeId: guidService.accountNumberGuid,  Value: gift.AccountNumber },
            { AttributeId: guidService.accountHolderGuid,  Value: gift.AccountHolder }
          ];

          return donation;
        },

        // Build standard pledge (used for paypal)
        buildPledgeDonation: function(donor, gift) {
          donation.Donor                 = donor;
          donation.Gift.PaymentMethod    = 1;

          // Add payment amount + designation ID
          if (gift.Designations.Amount == 'other')
            donation.Gift.Designations.push({DesignationId: guidService.designationGuid, Amount: parseFloat(gift.OtherAmount).toFixed(2)});
          else
            donation.Gift.Designations.push({DesignationId: guidService.designationGuid, Amount: parseFloat(gift.Designations.Amount).toFixed(2)});

          return donation;
        },

        buildTributeDonation: function(donor, gift, notification, ecard) {
          donation.Donor                 = donor;
          donation.Gift.PaymentMethod    = 1;

          // Add payment amount + designation ID
          if (gift.Designations.Amount == 'other')
              donation.Gift.Designations.push({DesignationId: guidService.designationGuid, Amount: parseFloat(gift.OtherAmount).toFixed(2)});
          else
              donation.Gift.Designations.push({DesignationId: guidService.designationGuid, Amount: parseFloat(gift.Designations.Amount).toFixed(2)});

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

          return donation;
        }
      };
  }).service('bbDonationService', function($http) {
      return {
        createDonation: function(donation, successCallback, errorCallback) {
          $http({
            method: 'POST',
            url: "https://bbnc21027d.blackbaudhosting.com/WebApi/1128/Donation/Create",
            data: donation,
            headers: {
              'Content-Type': 'application/json',
            }
          }).then(successCallback, errorCallback);
        }
      };
  });
