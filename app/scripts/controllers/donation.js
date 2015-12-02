'use strict';

/**
 * @ngdoc function
 * @name splcDonationApp.controller:DonationCtrl
 * @description
 * # DonationCtrl
 * Controller of the splcDonationApp
 */
angular.module('splcDonationApp')
  .controller('DonationController', ['$scope', '$http', 'donationIdService', function ($scope, $http, donationIdService) {

    // BB Country Service
    var cs = new BLACKBAUD.api.CountryService({
      url: '//bbnc21027d.blackbaudhosting.com/'
    });

    var designationId = "09ccef1b-97c6-455a-a793-42ab31888036";
    var merchantAccountId = "c6de7f55-a953-4e64-b382-147268e9b25f";

    // RETURN FAKE DONATION
    $scope.fakeDonation = function() {
      var tribute = {
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
      var ecardInfo = 'TributeeFirstName=Trogdor' +
                      '&TributeeLastName=Wishiwell' +
                      '&ImageIdentifier=19' +
                      '&SenderFirstName=Bruce' +
                      '&SenderLastName=Gingers' +
                      '&SenderEmailAddress=bruce@spiceracks.com' +
                      '&RecipientFirstName=Carlo' +
                      '&ReceipientLastName=Snarflugen' +
                      '&ReceipientEmailAddress=carlo@Snarflugen.com' +
                      '&PersonalMessage=On mange tout le monde' +
                      '&DonationId=' + tribute.Id +
                      '&DonationStatus' + tribute.TransationStatus +
                      '&TransactionStatus=1' +
                      '&HonorMemory=honor';


      $http({
        method: 'POST',
        url: '//splc.dev/ecard',
        data: encodeURI(ecardInfo),
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

    $scope.buildTribute = function(gift, notification, donor) {
      var tributeDonation = {};

      var tributeAmount =  gift.Designations.Amount == 'other' ?
                           gift.OtherAmount :
                           gift.Designations.Amount;


      // Build Donor info
      tributeDonation.Donor = donor;

      // Build Gift info
      tributeDonation.Gift = {};
      tributeDonation.Gift.Designations = [{
        Amount: tributeAmount,
        DesignationId: designationId
      }];
      tributeDonation.Gift.PaymentMethod = gift.PaymentMethod;

      // Build Tribute and Notification info
      tributeDonation.Gift.Tribute = {};
      tributeDonation.Gift.Tribute.TributeDefinition = {};
      tributeDonation.Gift.Tribute.TributeDefinition = gift.Tribute.TributeDefinition;
      tributeDonation.Gift.Tribute.TributeDefinition.Type = gift.Tribute.TributeDefinition.Type;
      tributeDonation.Gift.Tribute.TributeDefinition.Description =  gift.Tribute.TributeDefinition.Type;

      tributeDonation.Gift.Acknowledgee = {};
      tributeDonation.Gift.Acknowledgee = gift.Tribute.Acknowledgee;

      tributeDonation.Origin = "SPLC Tribute Donation";
      tributeDonation.PageName= "SPLC Donation"
      tributeDonation.BBSPReturnUri = 'http://localhost:9002/#/confirmation';
      tributeDonation.MerchantAccountId = merchantAccountId;

      return tributeDonation;
    }

    $scope.processTribute = function(gift, notification, donor, ecard) {
      var tributeDonation = $scope.buildTribute(gift, notification, donor);

      $http({
        method: 'POST',
        url: '//bbnc21027d.blackbaudhosting.com/WebApi/1128/Donation/Create',
        //url: 'https://raw.githubusercontent.com/thinkshout/splc_blackbaud/master/app/donation.json?token=AAhMON1PDjr50ve2dcJyiFb3BIq1Hxveks5WROSGwA%3D%3D',
        data: tributeDonation,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function successCallback(response) {
        //console.log(response);
        var tribute = response.data;
        //console.log(tribute);
        //window.location = returnedDonation.BBSPCheckoutUri;
        var ecardInfo = 'TributeeFirstName='+ tribute.Gift.Tribute.FirstName +
                        '&TributeeLastName='+ tribute.Gift.Tribute.LastName +
                        '&ImageIdentifier='+ ecard.Type +
                        '&SenderFirstName=' + tribute.Donor.FirstName +
                        '&SenderLastName=' + tribute.Donor.LastName +
                        '&RecipientFirstName=' + tribute.Gift.Tribute.Acknowledgee.FirstName +
                        '&ReceipientLastName=' + tribute.Gift.Tribute.Acknowledgee.LastName +
                        '&ReceipientEmailAddress=' + tribute.Gift.Tribute.Acknowledgee.Email +
                        '&PersonalMessage=' + tribute.Gift.Comments +
                        '&DonationId=' + tribute.Id +
                        '&TransactionStatus' + tribute.TransationStatus +
                        '&HonorMemory' + tribute.Gift.Tribute.TributeDefinition.Type;

        if (notification.Type == 'email' && tribute.TransactionStatus == '1') {
          $http({
            method: 'POST',
            url: '//splc.dev/ecard',
            //url: '//localhost:1222',
            data: encodeURI(ecardInfo),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then(function successCallback(response) {
            console.log(response);
            if (response.status == '200 OK') {
              $scope.confirmationMessage = 'Your ecard has been sent to ' + tribute.Gift.Tribute.Acknowledgee.Email;
              window.location = "http://localhost:9002/#/confirmation";
            }
          }, function errorCallback(response) {
            $scope.confirmationMessage = 'Your ecard could not be sent. Please contact customer service at 1-800-WE-CARE-DEEPLY';
            window.location = "http://localhost:9002/#/confirmation";
          });
        } else {
          $scope.confirmationMessage = 'Thank you. Your tribute has been made to ' + tribute.Gift.Tribute.Acknowledgee.FirstName;
          window.location = "http://localhost:9002/#/confirmation";
        }
      }, function errorCallback(response) {
        console.log(response);
      });
    }

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
        // Log the donationId in shared service for later use
        // donationIdService.setDonationId(response.Donation.Id);

        // Send  donation user to BB payment page 
        window.location = response.BBSPCheckoutUri;
      }, function errorCallback(response) {
        // If payment error send to error confirmation page
        window.location = window.location.origin + '/#/confirmation';
        //console.log(response);
      });
    };

    // Create a new donation once the form has been validated
    $scope.buildDonation = function(donor, gift) {

      // Set the donation amount
      var donationAmount = gift.Designations.Amount == 'other' ?
                           gift.OtherAmount :
                           gift.Designations.Amount;

      // Determine the payment method
      // Set to CC b/c BBPS doesn't allow ACH
      var paymentMethod = 0;

      // Declare donation object
      var donation = {};
      // Build the donor
      donation.Donor = donor;
      // Build the gift 
      donation.Gift = {};
      donation.Gift.Designations = [{
        "Amount": donationAmount,
        "DesignationId": designationId,
        "PaymentMethod": "BillMeLater (1)"
      }];

      // Set the confirmation url and return url
      // Only if the payment method is credit card
      if (paymentMethod == '0') {
        donation.BBSPReturnUri = window.location.href + 'confirmation';
        donation.MerchantAccountId = merchantAccountId;
      }

      // If the gift is a recurring donation 
      if (gift.Recurrence.Frequency == '2') {
        donation.Gift.Recurrence = {};
        // Set recurrence to today
        var today = new Date();
        donation.Gift.Recurrence.DayOfMonth = today.getDate(); // Set day of month
        donation.Gift.Recurrence.Frequency = parseInt(gift.Recurrence.Frequency); // Frequency is 2
        donation.Gift.Recurrence.StartDate = today;
      }

      // Send donation to BB
      $scope.processDonation(donation);
    };

    $scope.init = function() {
      $scope.getCountries();
      $scope.getStates();
      $scope.changeStates();
    };

    $scope.init();
}]);
