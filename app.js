//var base_url = 'https://brainscales.unic.cnrs-gif.fr/';
var base_url = 'https://172.17.1.80/';

var mainApp = angular.module('mainApp', [
	'ngRoute',
	'mod_tlv',
  'hermann.animal',
  'hermann.preparation',
	'hermann.experiments',
	'hermann.login',
	'hermann.people',
  'hermann.electrode',
  'hermann.neuron',
  'hermann.protocol',
	'hermann.blocks',
	'hermann.recording',
	'hermann.file',
	'hermann.image',
]);

mainApp.factory('errorHttpInterceptor', ['$q', function ($q) {
        return {
            responseError: function responseError(rejection) {
                if (rejection.status === 401 ) {
                    angular.element(location).attr('href','/app/#/login');
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
          when('/animal_list', {
            templateUrl: 'animal/animal_list.tpl.html',
            controller: 'ListAnimal'
          }).
          when('/animal/:eID', {
            templateUrl: 'animal/animal_detail.tpl.html',
            controller: 'DetailAnimal'
          }).
          when('/preparation_list', {
            templateUrl: 'preparation/preparation_list.tpl.html',
            controller: 'ListPreparation'
          }).
          when('/preparation/:eID', {
            templateUrl: 'preparation/preparation_detail.tpl.html',
            controller: 'DetailPreparation'
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
					when('/blocks_list', {
						templateUrl: 'blocks/blocks_list.tpl.html',
						controller: 'ListBlocks'
					}).
					when('/blocks/:eID', {
						templateUrl: 'blocks/blocks_detail.tpl.html',
						controller: 'DetailBlocks'
					}).
					when('/recording_list', {
						templateUrl: 'recording/recording_list.tpl.html',
						controller: 'ListRecordings'
					}).
					when('/recordings/recording/:eID', {
						templateUrl: 'recording/recording_detail.tpl.html',
						controller: 'DetailRecording'
					}).
					when('/files_list', {
						templateUrl: 'files/files_list.tpl.html',
						controller: 'ListFiles'
					}).
					when('/storage/file/:eID', {
						templateUrl: 'files/files_detail.tpl.html',
						controller: 'DetailFiles'
					}).
					when('/images_list', {
						templateUrl: 'images/images_list.tpl.html',
						controller: 'ListImages'
					}).
					when('/analysis/image/:eID', {
						templateUrl: 'images/images_detail.tpl.html',
						controller: 'DetailImages'
					}).
          when('/', {
            redirectTo: '/login'
          }).
          otherwise({
            redirectTo: '/experiment'
          });
  }]);
