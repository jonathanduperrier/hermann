'use strict';
/* Controllers */
var mod_exp = angular.module( 'hermann.animal', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'ui.bootstrap', 
    'angularModalService',
    'mod_tlv',
    'animalServices'
    ]);

mod_exp.controller('ListAnimal', [
  '$scope', 'animal' ,'ModalService',
  function($scope, animal, ModalService) {
  	$scope.animal = animal.get({}, function(data){
      $scope.animal.objects.forEach( function( animal ){
        var sup = animal.supplier.split('/');
        animal.supplier = sup[3];
      });
    });
    $scope.predicate = 'identifier';
    $scope.reverse = false;
    $scope.order = function(predicate) {
      $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
      $scope.predicate = predicate;
    };
  }
]);

mod_exp.controller('DetailAnimal', ['$scope', '$routeParams', 'animal' ,'ModalService', function($scope, $routeParams, animal, ModalService){
    $scope.animal = animal.get( {id: $routeParams.eID}, function(data){
        var sup = $scope.animal.supplier.split('/');
        $scope.animal.supplier = sup[3];
    });
  }
]);