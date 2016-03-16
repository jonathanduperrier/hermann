'use strict';
/* Controllers */
var mod_blocks = angular.module( 'hermann.blocks', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'ui.bootstrap',
    'angularModalService',
    'mod_tlv',
    'blockServices',
    'supplierServices',
    'ngRoute',
    ]);

    mod_blocks.controller('ListBlocks', [
      '$scope', '$rootScope', 'blocks' ,'ModalService', '$route', 'Experiment',
      function($scope, $rootScope, blocks, ModalService, $route, Experiment) {
        $rootScope.page_title = "Blocks";
        $scope.$route = $route;
        $rootScope.spin = 0;
      	$scope.block = blocks.get({}, function(data){
          $scope.block.objects.forEach( function( block ){
            var $block = block.resource_uri.split('/');
            var $idBlock = $block[3];
            block.id = $idBlock
            var experiment0 = block.experiment.split('/');
            var idExperiment = experiment0[2];
            $scope.experiment = Experiment.get({id:idExperiment}, function(data){
              block.experiment = data.label;
            });
          });
        });
        $scope.predicate = 'experiment';
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

    mod_blocks.controller('DetailBlocks', ['$scope', '$rootScope', '$routeParams', 'blocks' ,'ModalService', 'Experiment',
    function($scope, $rootScope, $routeParams, blocks, ModalService, Experiment){
        $rootScope.page_title = "Blocks";
        $scope.block = blocks.get( {id: $routeParams.eID}, function(data){
          var $block = $scope.block.resource_uri.split('/');
          var $idBlock = $block[3];
          $scope.block.id = $idBlock
          var experiment0 = $scope.block.experiment.split('/');
          var idExperiment = experiment0[2];
          $scope.experiment = Experiment.get({id:idExperiment}, function(data){
              $scope.block.experiment = data.label;
          });
        });
      }
    ]);
