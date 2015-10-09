'use strict';
/* Controllers */
var mod_exp = angular.module( 'hermann.protocol', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'ui.bootstrap', 
    'angularModalService',
    'mod_tlv'
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
  }
]);