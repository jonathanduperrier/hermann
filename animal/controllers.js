'use strict';
/* Controllers */
var mod_animal = angular.module( 'hermann.animal', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'ui.bootstrap',
    'angularModalService',
    'mod_tlv',
    'animalServices',
    'supplierServices',
    'ngRoute',
    ]);

mod_animal.controller('ListAnimal', [
  '$scope', '$rootScope', 'animals' ,'ModalService', '$route',
  function($scope, $rootScope, animals, ModalService, $route) {
    $scope.$route = $route;
    $rootScope.spin = 0;
  	$scope.animal = animals.get({}, function(data){
      $scope.animal.objects.forEach( function( animal ){
      });
    });
    $rootScope.page_title = "Animals";
    $scope.predicate = 'identifier';
    $scope.reverse = false;
    $scope.order = function(predicate) {
      $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
      $scope.predicate = predicate;
    };

    $scope.showDlgAnimal = function(animal){
      if( animal == null ){
        // ADD
        animal = {
          id: null,
          identifier: "",
          nickname: "",
          weight: "",
          sex: "",
          birth: new Date().format("yyyy-mm-dd"),
          sacrifice: new Date().format("yyyy-mm-dd"),
          supplier: null,
        };
        var edition = false;
      } else {
        // EDIT
        var edition = true;
      }
      ModalService.showModal({
        templateUrl: "animal/modal_dlg_animal.tpl.html",
        controller: "ManageAnimalController",
        inputs: {
          title: "Animal information",
          edition: edition,
          animal: animal,
        }
      }).then(function(modal) {
        modal.element.modal();
            modal.close.then( function(result) {
              if(result.del_animal == true){
                  $scope.showConfirmRemoveAnimal(result.animal);
              } else{
                  $scope.manageAnimal( result.animal, edition );
              }
          });
      });
    };

    $scope.manageAnimal = function(animal, edition){
      angular.element(window).spin();
      $rootScope.spin = 1;
      if(edition == false){
        animals.post(animal, function(data){
          $scope.stopSpin();
          $scope.$route.reload();
        });
      } else {
        animals.put({id:animal.id}, angular.toJson(animal), function(){
            $scope.stopSpin();
            $scope.$route.reload();
        });
      }
    };

    $scope.stopSpin = function() {
      if($rootScope.spin == 1){
        setTimeout(function(){ angular.element(window).spin(); }, 3500);
      }
      $rootScope.spin = 0;
    };
  }
]);

mod_animal.controller('ManageAnimalController', [
    '$scope', '$element', 'title', 'close', 'edition', 'animal',
    function($scope, $element, title, close, edition, animal) {
      $scope.animal = animal;
      $scope.title = title;

      $scope.beforeClose = function() {
        //console.log($scope.dateFormat);
        if($scope.animal.identifier == ""){
            $scope.msgAlert = "Identifier field is required";
        }
        else if($scope.animal.nickname == ""){
          $scope.msgAlert = "Nickname field is required";
        }
        else if(!$.isNumeric($scope.animal.weight)){
          $scope.msgAlert = "Weight field must be a number";
        }
        else if($scope.animal.sex == ""){
          $scope.msgAlert = "Sex field is required";
        }
        else if($scope.animal.birth == ""){
          $scope.msgAlert = "Birth field is required";
        }
        else if($scope.animal.sacrifice == ""){
          $scope.msgAlert = "Sacrifice field is required";
        }
        else {
            $scope.close();
        }
      };

      $scope.delete = function(){
          $scope.del_animal = true;
          $scope.close();
      };

      $scope.close = function() {
          close({
              animal: $scope.animal,
              del_animal: $scope.del_animal,
          }, 100); // close, but give 500ms for bootstrap to animate
      };

      //  This cancel function must use the bootstrap, 'modal' function because
      //  the doesn't have the 'data-dismiss' attribute.
      $scope.cancel = function() {
          //  Manually hide the modal.
          $element.modal('hide');
          //  Now call close, returning control to the caller.
          close({
              animal: $scope.animal,
          }, 100); // close, but give 500ms for bootstrap to animate
      };

}]);

mod_animal.controller('DetailAnimal', ['$scope', '$routeParams', 'animals' ,'ModalService', function($scope, $routeParams, animals, ModalService){
    $scope.animal = animals.get( {id: $routeParams.eID}, function(data){
    });
  }
]);
