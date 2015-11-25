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
        var sup0 = animal.supplier.split('/');
        animal.supplier = sup0[3];
      });
    });
    $scope.predicate = 'identifier';
    $scope.reverse = false;
    $scope.order = function(predicate) {
      $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
      $scope.predicate = predicate;
    };

    $scope.showDlgAnimal = function(animal){
      if( event == null ){
        // ADD
        
        edition = false;
      } else {
        // EDIT
        edition = true;
      }
    };
  }
]);

mod_tlv.controller('ManageAnimalController', [
    '$scope', '$element', 'title', 'close', 'edition', 'animal',
    function($scope, $element, title, close, edition, animal) {
      $scope.animal = animal;
      $scope.title = title;

    $scope.beforeClose = function() {
        //console.log($scope.dateFormat);
        event.date = new Date($scope.event.date);
        if($scope.event.identifier == ""){
            $scope.msgAlert = "Identifier field is required";
        } else {
            $scope.close();
        }
    };

    $scope.delete = function(){
        $scope.del_evt = true;
        $scope.close();
    };

    $scope.close = function() {
        close({
            event: $scope.event,
            del_evt: $scope.del_evt,
        }, 100); // close, but give 500ms for bootstrap to animate
    };

    //  This cancel function must use the bootstrap, 'modal' function because
    //  the doesn't have the 'data-dismiss' attribute.
    $scope.cancel = function() {
        //  Manually hide the modal.
        $element.modal('hide');
        //  Now call close, returning control to the caller.
        close({
            event: $scope.event,
        }, 100); // close, but give 500ms for bootstrap to animate
    };

}]);

mod_exp.controller('DetailAnimal', ['$scope', '$routeParams', 'animal' ,'ModalService', function($scope, $routeParams, animal, ModalService){
    $scope.animal = animal.get( {id: $routeParams.eID}, function(data){
        var sup0 = $scope.animal.supplier.split('/');
        $scope.animal.supplier = sup0[3];
    });
  }
]);