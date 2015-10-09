var base_url = 'http://helm1/';
var app_url = 'http://127.0.0.1:8080/';
//var base_url = 'https://www.dbunic.cnrs-gif.fr/visiondb/';


var mainApp = angular.module('mainApp', [
	'ngRoute',
	'mod_tlv',
	'hermann.experiments',
	'hermann.login',
	'hermann.people',
  'hermann.electrode',
  'hermann.neuron',
  'hermann.protocol',
]);

mainApp.factory('errorHttpInterceptor', ['$q', function ($q) {
        return {
            responseError: function responseError(rejection) {
                if (rejection.status === 401 ) {
                    angular.element(location).attr('href','/#/login');
                }
                return $q.reject(rejection);
            }
        };
    }]);

/**
 * Module Routes
 * AngularJS will handle the merging
 * Controller for each route are managed in the corresponding <module>/controllers.js
 */
mainApp.config(['$routeProvider', '$httpProvider',
      function ($routeProvider, $httpProvider) {
        $httpProvider.interceptors.push('errorHttpInterceptor');

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
          when('/electrode_list', {
            templateUrl: 'electrode/electrode_list.tpl.html',
            controller: 'ListElectrode'
          }).
          when('/electrode/:eID', {
            templateUrl: 'electrode/electrode_detail.tpl.html',
            controller: 'DetailElectrode'
          }).
          when('/neuron_list', {
            templateUrl: 'neuron/neuron_list.tpl.html',
            controller: 'ListNeuron'
          }).
          when('/neuron/:eID', {
            templateUrl: 'neuron/neuron_detail.tpl.html',
            controller: 'DetailNeuron'
          }).
          when('/protocol_list', {
            templateUrl: 'protocol/protocol_list.tpl.html',
            controller: 'ListProtocol'
          }).
          when('/protocol/:eID', {
            templateUrl: 'protocol/protocol_detail.tpl.html',
            controller: 'DetailProtocol'
          }).
          otherwise({
            redirectTo: '/experiment'
          });
  }]);