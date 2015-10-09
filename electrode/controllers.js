'use strict';
/* Controllers */
var mod_exp = angular.module( 'hermann.electrode', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'ui.bootstrap', 
    'angularModalService',
    'mod_tlv'
    ]);

mod_exp.controller('ListElectrode', [
  '$scope', 'electrode' ,'ModalService', 'timeLine', 'Experiment',
  function($scope, electrode, ModalService, timeLine, Experiment) {
  	$scope.electrode = electrode.get({}, function(data){
      $scope.electrode.objects.forEach( function( elec ){
        var $type = elec.type.split('/');
        elec.type = $type[3];
        var $manufacturer = elec.manufacturer.split('/');
        elec.manufacturer = $manufacturer[3];
        //get timeline
        var $timeline = elec.timeline.split('/');
        var $idTimeline = parseInt($timeline[3]);
        elec.timeline = timeLine.get({id:$idTimeline}, function(data){
          var $exp = data.experiment;
          //get experiment
          var $experiment = $exp.split('/');
          var $idExperiment = $experiment[2];
          elec.experiment = Experiment.get({id:$idExperiment});
        });
      });
    });
    $scope.predicate = 'label';
    $scope.reverse = false;
    $scope.order = function(predicate) {
      $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
      $scope.predicate = predicate;
    };
  }
]);

mod_exp.controller('DetailElectrode', ['$scope', '$routeParams', 'timeLine', 'electrode', 'Experiment', function($scope, $routeParams, timeLine, electrode, Experiment){
    $scope.elec = electrode.get( {id: $routeParams.eID}, function(data){
        var $type = $scope.elec.type.split('/');
        $scope.elec.type = $type[3];
        var $manufacturer = $scope.elec.manufacturer.split('/');
        $scope.elec.manufacturer = $manufacturer[3];
        //get timeline
        var $timeline = $scope.elec.timeline.split('/');
        var $idTimeline = parseInt($timeline[3]);
        $scope.elec.timeline = timeLine.get({id:$idTimeline}, function(data){
          var $exp = data.experiment;
          //get experiment
          var $experiment = $exp.split('/');
          var $idExperiment = $experiment[2];
          $scope.elec.experiment = Experiment.get({id:$idExperiment});
        });
    });
  }
]);