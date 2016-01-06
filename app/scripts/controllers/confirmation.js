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
        }).then(function successCallback(response) {
            if (donation.transactionStatus === '1') {
              $scope.statusHeading = "Your donation is complete";
              $scope.statusBody = 'Thank you for your donation of $' + donation.Gift.Designations[0].Amount;

              // Additionally if it has a tribute send the Ecard
              if (donation.Gift.Tribute.Acknowledgee) {
                var ecardSent = $scope.sendEcard(donation);
                if (ecardSent) {
                  $scope.statusBody = 'Thank you for your donation of $' +
                                      donation.Gift.Designations[0].Amount +
                                      '. Your ecard has been sent';
                } else {
                  $scope.statusBody = 'Thank you for your donation of $' +
                                      donation.Gift.Designations[0].Amount +
                                      '. We were unable to send your eCard, please contact us at 1-800-ECARD-NOW.';
                }
              }
            }
        }, function errorCallback(response) {
            console.log(response);
            $scope.statusHeading = "Transaction Incomplete";
            $scope.statusBody = "We were unable to process your donation."
        });
     };


    $scope.init = function() {
      var localDonation = donationLogger.getDonation();
      var localTransactionId = localDonation.transactionId;
      var remoteDonationId = window.location.search.replace('?t=','');
      //var transactionId = "6c0952e5-9177-4055-8c6a-d315d99a0c01";
      if (remoteDonationId === '') {
        $scope.checkPaymentStatus(localTransactionId);
      } else {
        $scope.checkPaymentStatus(remoteTransactionId);
      }
    };

    $scope.init();
}]);
