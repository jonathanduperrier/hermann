'use strict';
/* Controllers */
var mod_exp = angular.module( 'hermann.neuron', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'ui.bootstrap', 
    'angularModalService',
    'mod_tlv'
    ]);

mod_exp.controller('ListNeuron', [
  '$scope', 'neuron' ,'ModalService', 'CellType', 'electrode', 'timeLine', 'Experiment',
  function($scope, neuron, ModalService, CellType, electrode, timeLine, Experiment) {
  	$scope.neuron = neuron.get({}, function(data){
      $scope.neuron.objects.forEach( function( neur ){
        var $type = neur.type.split('/');
        var $idType = $type[3];
        neur.type = CellType.get({id:$idType});
        var $electrode = neur.electrode.split('/');
        var $idElectrode = $electrode[3];
        neur.electrode = electrode.get({id:$idElectrode});
        //get timeline
        var $timeline = neur.timeline.split('/');
        var $idTimeline = parseInt($timeline[3]);
        neur.timeline = timeLine.get({id:$idTimeline}, function(data){
          var $exp = data.experiment;
          //get experiment
          var $experiment = $exp.split('/');
          var $idExperiment = $experiment[2];
          neur.experiment = Experiment.get({id:$idExperiment});
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

mod_exp.controller('DetailNeuron', ['$scope', '$routeParams', 'timeLine', 'electrode' ,'neuron', 'Experiment', 'CellType', function($scope, $routeParams, timeLine, electrode, neuron, Experiment, CellType){
    $scope.neur = neuron.get( {id: $routeParams.eID}, function(data){
        var $type = $scope.neur.type.split('/');
        var $idType = $type[3];
        $scope.neur.type = CellType.get({id:$idType});
        var $electrode = $scope.neur.electrode.split('/');
        var $idElectrode = $electrode[3];
        $scope.neur.electrode = electrode.get({id:$idElectrode});
        //get timeline
        var $timeline = $scope.neur.timeline.split('/');
        var $idTimeline = parseInt($timeline[3]);
        $scope.neur.timeline = timeLine.get({id:$idTimeline}, function(data){
          var $exp = data.experiment;
          //get experiment
          var $experiment = $exp.split('/');
          var $idExperiment = $experiment[2];
          $scope.neur.experiment = Experiment.get({id:$idExperiment});
        });
    });
}]);