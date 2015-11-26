'use strict';
/* Controllers */
var mod_exp = angular.module( 'hermann.preparation', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'hermann.animal',
    'ui.bootstrap', 
    'angularModalService',
    'mod_tlv',
    'preparationServices',
    'animalServices',
    'itemDevicesServices'
    ]);

mod_exp.controller('ListPreparation', [
  '$scope', 'preparation', 'animals', 'itemDevices' ,'ModalService',
  function($scope, preparation, animals, itemDevices, ModalService) {
  	$scope.preparation = preparation.get({}, function(data){
      $scope.preparation.objects.forEach(function(prep, key){
        var animal0 = prep.animal.split('/');
        var idAnimal = animal0[3];
        $scope.animal = animals.get({id:idAnimal}, function(data){
          $scope.preparation.objects[key].animal = data.identifier;
        });

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

mod_exp.controller('DetailPreparation', ['$scope', '$routeParams', 'preparation', 'animals', 'itemDevices' ,'ModalService', function($scope, $routeParams, preparation, animals, itemDevices, ModalService){
    $scope.prep = preparation.get( {id: $routeParams.eID}, function(prep){
      
        var animal0 = prep.animal.split('/');
        var idAnimal = animal0[3];
        $scope.animal = animals.get({id:idAnimal}, function(data){
          prep.animal = data.identifier;
        });
    });
  }
]);