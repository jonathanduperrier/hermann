var mainApp = angular.module('mainApp', ['ngRoute', 'mod_exp', 'mod_tlv', 'hermann.experiments' ]);

/**
 * Module Routes
 * AngularJS will handle the merging
 * Controller for each route are managed in the corresponding <module>/controllers.js
 */

mainApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/experiments', {
        templateUrl: 'experiments/list.tpl.html',
        controller: 'ListExperiment'
      }).
      when('/experiment/:eId', {
         templateUrl: 'experiments/detail.tpl.html', 
         controller: 'DetailExperiment'
	  }).
	  when('/experiment/:eId/edit', {
	     templateUrl: 'experiments/edit.tpl.html', 
	     controller: 'EditExperiment'
	  }).
      when('/timeline', {
        templateUrl: 'timeline_visual.html',
        controller: 'timeLineVisualController'
      }).
      otherwise({
        redirectTo: '/experiments'
      });
  }]);