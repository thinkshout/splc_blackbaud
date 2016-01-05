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
          setDonation: function(donationObj) {
              donation = donationObj;
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
          designationGuid:     "09ccef1b-97c6-455a-a793-42ab31888036",
          merchantAccountGuid: "c6de7f55-a953-4e64-b382-147268e9b25f",
          defaultCountryGuid:  "d81cef85-7569-4b2e-8f2e-f7cf998a3342",
          // ACH Monthly
          achMonthlyGuid:      "9E113408-E211-4DFC-9833-27B0514783A4",
          accountHolderGuid:   "A36D66E0-7BBB-4226-9DA4-A4238FCA209C",
          accountNumberGuid:   "7CB68E73-DC56-4AF8-A279-DE762C0A7600",
          routingNumberGuid:   "F2D65A45-2A53-4850-841E-FD53A0F67431",
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

          // Commented out until issue resolved with attributes
          /*donation.Gift.Attributes = [
            { attributeId: guidService.achMonthlyGuid,     value: 'yes'              },
          ];*/

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

          // Commented out until issue resolved with attributes
          /*donation.Gift.Attributes = [
            { AttributeId: guidService.achMonthlyGuid,     Value: 'yes'              },
            { AttributeId: guidService.routingNumberGuid,  Value: gift.Routing       },
            { AttributeId: guidService.accountNumberGuid,  Value: gift.AccountNumber },
            { AttributeId: guidService.accountHolderGuid,  Value: gift.AccountHolder },
          ] */

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
