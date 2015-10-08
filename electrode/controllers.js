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
  	$scope.electrode = electrode.get({}, function(data){
      $scope.electrode.objects.forEach( function( elec ){
        var $type = elec.type.split('/');
        elec.type = $type[3];
        var $manufacturer = elec.manufacturer.split('/');
        elec.manufacturer = $manufacturer[3];
      });
    });
  }
]);