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
  '$scope', 'protocol' ,'ModalService', 'neuron',
  function($scope, protocol, ModalService, neuron) {
  	$scope.protocol = protocol.get({}, function(data){
      $scope.protocol.objects.forEach( function( prot ){
        var $neur = prot.neuron.split('/');
        var $idNeur = $neur[3];
        prot.neuron = neuron.get({id:$idNeur});

      });
    });
  }
]);