(function () {
  'use strict';

  angular.module('consumerServiceApp', ['ngRoute', 'ccSdk']).
    config( function ($routeProvider) {
      $routeProvider
        .when('/start', {
          templateUrl: 'views/terminalID.html',
          controller: 'terminalIDController'
        })
        .otherwise({
          redirectTo: '/start'
        });
    });
});
