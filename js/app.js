var mainApp = angular.module('mainApp', ['ngRoute', 'mod_tlv']);

mainApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/timeline', {
        templateUrl: 'timeline_visual.html',
        controller: 'timeLineVisualController'
      }).
      /*when('/phones/:phoneId', {
        templateUrl: 'partials/phone-detail.html',
        controller: 'PhoneDetailCtrl'
      }).*/
      otherwise({
        redirectTo: '/'
      });
  }]);