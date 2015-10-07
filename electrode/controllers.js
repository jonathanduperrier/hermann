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
  '$scope', 'electrode' ,'ModalService',
  function($scope, electrode, ModalService) {
  	$scope.electrode = electrode.get();


}]);