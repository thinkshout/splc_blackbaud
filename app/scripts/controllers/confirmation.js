'use strict';

/**
 * @ngdoc function
 * @name splcDonationApp.controller:DonationCtrl
 * @description
 * # ConfirmationCtrl
 * Controller of the splcDonationApp
 */
angular.module('splcDonationApp')
  .controller('ConfirmationController', ['$scope', '$http', 'donationLogger', 'ecardIdService', function ($scope, $http, donationLogger, ecardIdService) {

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
          if (response.status === '200') {
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
            var donation = response.Data;
            // If it's a credit card donation
            if (donation.TransactionId == 1 ) {

            }
        }, function(response) {
            console.log(response);
            $scope.statusHeading = "Transaction Incomplete";
            $scope.statusBody = "We were unable to process your donation."
        });
     };


    $scope.init = function() {
      var localDonation = donationLogger.getDonation();
      var transactionId = localDonation.transactionId;
      var transactionId = "6c0952e5-9177-4055-8c6a-d315d99a0c01";
      if (transactionId === '') {
        var remoteDonationId = window.location.search.replace('?t=','');
        $scope.checkPaymentStatus(remoteDonationId);
      } else {
        $scope.checkPaymentStatus(transactionId);
      }
    };

    $scope.init();
}]);
