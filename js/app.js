var base_url = 'http://helm1/';
//var base_url = 'https://www.dbunic.cnrs-gif.fr/visiondb/';


var mainApp = angular.module('mainApp', [
	'ngRoute',
	'mod_tlv',
	'hermann.experiments',
	'hermann.login',
	'hermann.people'
]);

/**
 * Module Routes
 * AngularJS will handle the merging
 * Controller for each route are managed in the corresponding <module>/controllers.js
 */

mainApp.config(['$routeProvider', '$resourceProvider',
  function($routeProvider, $resourceProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'login/form.tpl.html',   
        controller: 'LoginForm'
      }).
      when('/experiment', {
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
      when('/timeline/experiment/:eID', {
        templateUrl: 'timeline/timeline_visual.tpl.html',
        controller: 'timeLineVisualController'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);