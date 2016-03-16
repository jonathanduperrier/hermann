'use strict';
/* Controllers */
var mod_recordings = angular.module( 'hermann.recording', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'ui.bootstrap',
    'angularModalService',
    'mod_tlv',
    'recordingServices',
    'supplierServices',
    'ngRoute',
    ]);

    mod_recordings.controller('ListRecordings', [
      '$scope', '$rootScope', 'recordings' ,'ModalService', '$route', 'blocks',
      function($scope, $rootScope, recordings, ModalService, $route, blocks) {
        $rootScope.page_title = "Recordings";
        $scope.$route = $route;
        $rootScope.spin = 0;
      	$scope.recording = recordings.get({}, function(data){
          $scope.recording.objects.forEach( function( recording ){
            var $recording = recording.resource_uri.split('/');
            var $idRecording = $recording[3];
            recording.id = $idRecording;

            var block0 = recording.block.split('/');
            var idBlock = block0[3];
            $scope.block = blocks.get({id:idBlock}, function(data){
              recording.block = data.name;
            });

          });
        });
        $scope.predicate = 'name';
        $scope.reverse = false;

        $scope.order = function(predicate) {
          $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
          $scope.predicate = predicate;
        };

        $scope.stopSpin = function() {
          if($rootScope.spin == 1){
            setTimeout(function(){ angular.element(window).spin(); }, 3500);
          }
          $rootScope.spin = 0;
        };
      }
    ]);

    mod_recordings.controller('DetailRecording', ['$scope', '$rootScope', '$routeParams', 'recordings' ,'ModalService', 'blocks',
    function($scope, $rootScope, $routeParams, recordings, ModalService, blocks){
        $rootScope.page_title = "Recordings";
        $scope.recording = recordings.get( {id: $routeParams.eID}, function(data){
          var $recording = $scope.recording.resource_uri.split('/');
          var $idRecording = $recording[3];
          $scope.recording.id = $idRecording
          var block0 = $scope.recording.block.split('/');
          var idBlock = block0[3];
          $scope.block = blocks.get({id:idBlock}, function(data){
            $scope.recording.block = data.name;
          });
        });
      }
    ]);
