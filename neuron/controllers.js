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
  '$scope', 'neuron' ,'ModalService',
  function($scope, neuron, ModalService) {
  	$scope.neuron = neuron.get();


}]);