'use strict';

/**
 * @ngdoc function
 * @name splcDonationApp.controller:DonationCtrl
 * @description
 * # ConfirmationCtrl
 * Controller of the splcDonationApp
 */
angular.module('splcDonationApp')
  .controller('PaypalController', ['$scope', '$http', '$location', 'paypalService', function ($scope, $http, $location, paypalService) {

    $scope.confirmationPath = function() {
      return window.location.origin + '/#/confirmation';
    };

    $scope.paypalDonor = paypalService.getPaypalDonor();

    $scope.sendPledgeToBB = function(donation) {
       $http({
          method: 'POST',
          url: 'https://bbnc21027d.blackbaudhosting.com/WebApi/1128/Donation/Create',
          data: donation,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function successCallback(response) {
              var responseData = response.data;
              donationIdService.setDonationId(responseData.Donation.Id);
        }, function errorCallback(response) {
            // If payment error send to error confirmation page
            //$location.path('/confirmation');
            //$('form').submit();
            console.log(response);
        }); 
    };

    $scope.submitForm = function() {
      $scope.sendPledgeToBB();
    };

}]);
