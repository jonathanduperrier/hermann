'use strict';
/* Controllers */
var mod_exp = angular.module( 'hermann.protocol', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'ui.bootstrap', 
    'angularModalService',
    'mod_tlv',
    'protocolServices'
    ]);

mod_exp.controller('ListProtocol', [
  '$scope', 'protocol' ,'ModalService', 'neuron','timeLine', 'Experiment',
  function($scope, protocol, ModalService, neuron, timeLine, Experiment) {
  	$scope.protocol = protocol.get({}, function(data){
      $scope.protocol.objects.forEach( function( prot ){
        var $neur = prot.neuron.split('/');
        var $idNeur = $neur[3];
        prot.neuron = neuron.get({id:$idNeur});

        //get timeline
        var $timeline = prot.timeline.split('/');
        var $idTimeline = parseInt($timeline[3]);
        prot.timeline = timeLine.get({id:$idTimeline}, function(data){
          var $exp = data.experiment;
          //get experiment
          var $experiment = $exp.split('/');
          var $idExperiment = $experiment[2];
          prot.experiment = Experiment.get({id:$idExperiment});
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

mod_exp.controller('DetailProtocol', ['$scope', '$routeParams', 'timeLine', 'neuron', 'protocol', 'Experiment', function($scope, $routeParams, timeLine, neuron, protocol, Experiment){
  $scope.prot = protocol.get( {id: $routeParams.eID}, function(data){

  });
}]);