'use strict';

/**
 * @ngdoc function
 * @name splcDonationApp.controller:DonationCtrl
 * @description
 * # ConfirmationCtrl
 * Controller of the splcDonationApp
 */
angular.module('splcDonationApp')
  .controller('CCConfirmController', ['$scope', '$http', 'donationLogger', 'ecardIdService', function ($scope, $http, donationLogger, ecardIdService) {

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
            if (donation.TransactionId == 1 && ) {

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
