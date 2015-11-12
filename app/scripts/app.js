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
        controller: 'DonationController'
      })
      .when('/faker', {
        controller: 'DonationController',
        templateUrl: 'views/faker.html',
        controllerAs: 'donation'
      })
      .otherwise({
        redirectTo: '/'
      });
  }).config(function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.headers.common["Content-Type"] = "text/plain";
  });
