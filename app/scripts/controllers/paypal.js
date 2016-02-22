'use strict';

/**
 * @ngdoc function
 * @name splcDonationApp.controller:DonationCtrl
 * @description
 * # ConfirmationCtrl
 * Controller of the splcDonationApp
 */
angular.module('splcDonationApp')
  .controller('PaypalController', ['$scope', '$http', '$location', 'donationLogger', function ($scope, $http, $location, donationLogger) {

    $scope.confirmationPath = function() {
      return window.location.origin + '/#/confirmation';
    };

    $scope.paypalDonor = donationLogger.getDonation();

    $scope.init = function () {
      window.scrollTo(0,0);
    }

    $scope.init();
}]);
