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
  '$scope', 'protocol' ,'ModalService',
  function($scope, protocol, ModalService) {
  	$scope.protocol = protocol.get();
  }
]);