'use strict';

/**
 * @ngdoc function
 * @name splcDonationApp.controller:DonationCtrl
 * @description
 * # ConfirmationCtrl
 * Controller of the splcDonationApp
 */
angular.module('splcDonationApp')
  .controller('ConfirmationController', ['$scope', '$http', 'donationIdService', function ($scope, $http, donationIdService) {

    $scope.checkPaymentStatus = function(donationId) {

      $http({
        method: 'GET',
        url: 'https://bbnc21027d.blackbaudhosting.com/WebApi/1128/Donation/'+donationId,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function successCallback(response) {
        console.log(response);
        if (response.status == 200 && response.data.TransactionStatus == '1') {
          // Set confirmation text
          $('#status-heading').text('Transaction Complete')
          $('#status-body').text('Thank you for your payment.')
        } else {
          $('#status-heading').text('Transaction Incomplete')
          $('#status-body').text('We were unable to process your payment.')
        }
      }, function errorCallback(response) {
          $('#status-heading').text('Transaction Incomplete')
          $('#status-body').text('The application encountered an error.')
      }); 
    }

    $scope.init = function() {
      var donationId = window.location.search.replace('?t=','');
      $scope.checkPaymentStatus("4543519c-f333-4b81-a92e-a3326166d736");
    };

    $scope.init();
}]);
