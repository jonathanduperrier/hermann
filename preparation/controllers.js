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
    'animalServices'
    ]);

mod_exp.controller('ListPreparation', [
  '$scope', 'preparation', 'animal' ,'ModalService',
  function($scope, preparation, animal, ModalService) {
  	$scope.preparation = preparation.get({}, function(data){
      $scope.preparation.objects.forEach(function(prep, key){

        var animal0 = prep.animal.split('/');
        var idAnimal = animal0[3];
        $scope.animal = animal.get({id:idAnimal}, function(data){
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

mod_exp.controller('DetailPreparation', ['$scope', '$routeParams', 'preparation' ,'ModalService', function($scope, $routeParams, preparation, ModalService){
    $scope.prep = preparation.get( {id: $routeParams.eID}, function(data){
        /*var $type = $scope.elec.type.split('/');
        $scope.elec.type = $type[3];
        var $manufacturer = $scope.elec.manufacturer.split('/');
        $scope.elec.manufacturer = $manufacturer[3];
        //get timeline
        var $timeline = $scope.elec.timeline.split('/');
        var $idTimeline = parseInt($timeline[3]);
        $scope.elec.timeline = timeLine.get({id:$idTimeline}, function(data){
          var $exp = data.experiment;
          //get experiment
          var $experiment = $exp.split('/');
          var $idExperiment = $experiment[2];
          $scope.elec.experiment = Experiment.get({id:$idExperiment});
        });*/
    });
  }
]);