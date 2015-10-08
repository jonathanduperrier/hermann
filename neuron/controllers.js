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
  '$scope', 'neuron' ,'ModalService', 'CellType', 'electrode',
  function($scope, neuron, ModalService, CellType, electrode) {
  	$scope.neuron = neuron.get({}, function(data){
      $scope.neuron.objects.forEach( function( neur ){
        var $type = neur.type.split('/');
        var $idType = $type[3];
        neur.type = CellType.get({id:$idType});
        var $electrode = neur.electrode.split('/');
        var $idElectrode = $electrode[3];
        neur.electrode = electrode.get({id:$idElectrode});
      });
    });
}]);