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

    // BB Country Service
    var cs = new BLACKBAUD.api.CountryService({
      url: '//bbnc21027d.blackbaudhosting.com/'
    });

    $scope.logger = function(thing) {
      console.log(thing);
    };

    // RETURN FAKE DONATION
    $scope.fakeDonation = function() {
      var donor = {
          "Donor": {
              "Address": {
                  "City": "Columbia",
                  "Country": "United States",
                  "PostalCode": "29212",
                  "State": "SC",
                  "StreetAddress": "123 Main St."
              },
              "EmailAddress": "john.doe@blackbaud.com",
              "FirstName": "John",
              "LastName": "Doe",
              "Phone": "555-555-5555",
              "Title": "Mr."
          },
          "Gift": {
              "Designations": [
                  {
                      "Amount": 5,
                      "DesignationId": "3439a5c7-9977-4f9c-ba11-fadfb8144d35"
                  }
              ],
              "FinderNumber": 0,
              "SourceCode": "Sample Source Code",
              "IsAnonymous": false,
              "PaymentMethod": 1,
              "Comments": "Gift comments here.",
              "CreateGiftAidDeclaration": false,
              "Attributes": [
                  {
                      "AttributeId": "BD18B3FD-B382-4183-A415-8F84B1E0E411",
                      "Value": "Volunteer;Member;Alumni"
                  },
                  {
                      "AttributeId": "3607C77D-19DC-4EE0-A0CD-A352762A8EF0",
                      "Value": "1985"
                  }
              ],
              "Recurrence": {
                  "DayOfMonth": 26,
                  "DayOfWeek": null,
                  "EndDate": null,
                  "Frequency": 2,
                  "Month": null,
                  "StartDate": "Date(1337227200000-0400)"
              },
              "Tribute": {
                  "Acknowledgee": {
                      "AddressLines": "123 Sunset ln.",
                      "City": "Charleston",
                      "Country": "USA",
                      "Email": "email@address.com",
                      "FirstName": "Jane",
                      "LastName": "Doe",
                      "Phone": "123-123-1234",
                      "PostalCode": "29482",
                      "State": "SC"
                  },
                  "TributeDefinition": {
                      "Description": "New tribute",
                      "FirstName": "John",
                      "LastName": "Hancock",
                      "Type": "Tribute"
                  },
                  "TributeId": null
              }
          },
          "Id": "853f96be-bf08-4828-aefa-326a06e48d31",
          "Origin": {
              "AppealId": "C3B20FD8-6A81-451E-BF78-D195E82B4CBF",
              "PageId": 784,
              "PageName": "Sample Page"
          },
          "TransactionStatus": 1
      }

      $http({
        method: 'POST',
        url: '//splc.dev/ecard',
        data: JSON.stringify(donor),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(function successCallback(response) {
        console.log(response);
      }, function errorCallback(response) {
        console.log(response);
      });
    }; // end fakeDonation;

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

    $scope.buildTribute= function(gift, notification, donor) {
      var tributeDonation = {};

      // Build Donor info
      tributeDonation.Donor = donor;

      // Build Gift info
      tributeDonation.Gift = {};
      tributeDonation.Gift.Designations = [{
        Amount: gift.Designations.Amount,
        DesignationId: ""
      }];
      tributeDonation.Gift.PaymentMethod = gift.PaymentMethod;

      // Build Tribute and Notification info
      tributeDonation.TributeDefinition = {};


      if (donation.Gift.PaymentMethod == '0') {
        // TODO: Process credit card
      } else if (donation.Gift.PaymentMethod == '1') {
        // TODO: Send pledge and ecard here
      }

      console.log(tributeDonation);
    }

    $scope.createDonation = function(donation) {

      $http({
        method: 'POST',
        url: '//bbnc21027d.blackbaudhosting.com/WebApi/1128/Donation/Create',
        data: donation,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function successCallback(response) {
        console.log(response);
        var returnedDonation = response.data;
        console.log(returnedDonation);
        window.location = returnedDonation.BBSPCheckoutUri;
      }, function errorCallback(response) {
        console.log(response);
      });
    };

    // Create a new donation once the form has been validated
    $scope.buildDonation = function(donor, gift) {

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

      createDonation(donation);
    };

    $scope.init = function() {
      $scope.getCountries();
      $scope.getStates();
      $scope.changeStates();
      //$scope.createDonation();
    };

    $scope.init();
}]);
