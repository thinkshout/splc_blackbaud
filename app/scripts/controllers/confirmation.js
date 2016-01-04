'use strict';

/**
 * @ngdoc function
 * @name splcDonationApp.controller:DonationCtrl
 * @description
 * # ConfirmationCtrl
 * Controller of the splcDonationApp
 */
angular.module('splcDonationApp')
  .controller('ConfirmationController', ['$scope', '$http', 'donationIdService', 'ecardIdService', function ($scope, $http, donationIdService, ecardIdService) {

    $scope.sendEcard = function(donation) {
      console.log('Donation:'+ donation);
      var ecardInfo = 'TributeeFirstName=' + donation.Gift.Tribute.TributeDefinition.FirstName +
                      '&TributeeLastName=' + donation.Gift.Tribute.TributeDefinition.LastName +
                      '&ImageIdentifier=' + ecardIdService.getEcardId() +
                      '&SenderFirstName=' + donation.Donor.FirstName +
                      '&SenderLastName=' + donation.Donor.LastName +
                      '&SenderEmailAddress=' + donation.Donor.EmailAddress +
                      '&RecipientFirstName=' + donation.Gift.Tribute.Acknowledgee.FirstName +
                      '&RecipientLastName=' + donation.Gift.Tribute.Acknowledgee.LastName +
                      '&RecipientEmailAddress=' + donation.Gift.Tribute.Acknowledgee.Email +
                      '&PersonalMessage=' + donation.Gift.Comments +
                      '&TransactionStatus=' + donation.TransactionStatus +
                      '&HonorMemory=' + donation.Gift.Tribute.TributeDefinition.Type;

        console.log('Ecard: '+ ecardInfo);

        $http({
          method: 'POST',
          url: '//ecard-splc.pantheon.io/' + donation.Id,
          data: encodeURI(ecardInfo),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then(function successCallback(response) {
          console.log(response);
          if (response.status == '200') {
            return true;
          } else {
            return false;
          }
        }, function errorCallback(response) {
          console.log(response);
          return false;
        });
    };

     $scope.checkPaymentStatus = function(donationId) {
         $http({
             method: 'GET',
             url: 'https://bbnc21027d.blackbaudhosting.com/WebApi/1128/Donation/'+donationId,
             headers: {
               'Content-Type': 'application/json'
             }
         }).then(function(response) {
            console.log(response);
        }, function(response) {
            console.log(response);
        });
     };


    // $scope.checkPaymentStatus = function(donationId) {
    //
    //   $http({
    //     method: 'GET',
    //     url: 'https://bbnc21027d.blackbaudhosting.com/1128/Donation/'+donationId,
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    //   }).then(function successCallback(response) {
    //     var responseData = response.data;
    //     if (response.status == 200 && responseData.TransactionStatus == '1') {
    //       // If the transaction is a tribute fire off an email to drupal
    //       // Check and see if it has an email on it
    //       if (responseData.Gift.Tribute  && $scope.sendEcard(responseData)) {
    //         $('#status-heading').text('Transaction Complete');
    //         $('#status-body').text(
    //           'Thank you for your payment of $'+ responseData.Gift.Designations[0].Amount +'. ' +
    //           'Your notification email has been sent'
    //         );
    //       } else {
    //         // Set confirmation text
    //         $('#status-heading').text('Transaction Complete');
    //         $('#status-body').text('Thank you for your payment of $'+ responseData.Gift.Designations[0].Amount +'.');
    //         $('#status-body').append('<br><strong> We we\'re unable to send your ecard. Please contact SPLC at 1-800-ECARD-HELP</strong>');
    //       }
    //     } else {
    //       $('#status-heading').text('Transaction Incomplete');
    //       $('#status-body').text('We were unable to process your payment.');
    //     }
    //   }, function errorCallback(response) {
    //       $('#status-heading').text('Transaction Incomplete');
    //       $('#status-body').text('The application encountered an error.');
    //   });
    // }

    $scope.init = function() {
      //var localDonationId = donationIdService.getDonationId();
      var localDonationId = "6c0952e5-9177-4055-8c6a-d315d99a0c01";
      if (localDonationId == '') {
        var remoteDonationId = window.location.search.replace('?t=','');
        $scope.checkPaymentStatus(remoteDonationId);
      } else {
        $scope.checkPaymentStatus(localDonationId);
      }
    };

    $scope.init();
}]);
