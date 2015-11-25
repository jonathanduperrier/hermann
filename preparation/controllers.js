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

        var device0 = prep.equipment.split('/');
        var idItemDevice = device0[3];
        $scope.itemDevices = itemDevices.get({id:idItemDevice}, function(data){
          $scope.preparation.objects[key].equipment = data.label + " - " + data.model;
        });

        var cutting_solution0 = prep.cutting_solution.split('/');
        $scope.preparation.objects[key].cutting_solution = cutting_solution0[3];

        var bath_solution0 = prep.bath_solution.split('/');
        $scope.preparation.objects[key].bath_solution = bath_solution0[3];
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

mod_exp.controller('DetailPreparation', ['$scope', '$routeParams', 'preparation', 'animal', 'itemDevices' ,'ModalService', function($scope, $routeParams, preparation, animal, itemDevices, ModalService){
    $scope.prep = preparation.get( {id: $routeParams.eID}, function(prep){

        var animal0 = prep.animal.split('/');
        var idAnimal = animal0[3];
        $scope.animal = animal.get({id:idAnimal}, function(data){
          prep.animal = data.identifier;
        });

        var device0 = prep.equipment.split('/');
        var idItemDevice = device0[3];
        $scope.itemDevices = itemDevices.get({id:idItemDevice}, function(data){
          prep.equipment = data.label + " - " + data.model;
        });

        var cutting_solution0 = prep.cutting_solution.split('/');
        prep.cutting_solution = cutting_solution0[3];

        var bath_solution0 = prep.bath_solution.split('/');
        prep.bath_solution = bath_solution0[3];
    });
  }
]);