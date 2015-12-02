'use strict';
/* Controllers */
var mod_prep = angular.module( 'hermann.preparation', [
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

mod_prep.controller('ListPreparation', [
  '$scope', '$rootScope', 'preparations', 'animals', 'itemDevices' ,'ModalService', '$route',
  function($scope, $rootScope, preparations, animals, itemDevices, ModalService, $route) {
    $scope.$route = $route;
    $rootScope.spin = 0;

  	$scope.preparation = preparations.get({}, function(data){
      $scope.preparation.objects.forEach(function(prep, key){
        var animal0 = prep.animal.split('/');
        var idAnimal = animal0[3];
        $scope.animal = animals.get({id:idAnimal}, function(data){
          $scope.preparation.objects[key].animal0 = data.identifier;
        });

      });
    });
    $scope.predicate = 'identifier';
    $scope.reverse = false;
    $scope.order = function(predicate) {
      $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
      $scope.predicate = predicate;
    };

    $scope.showDlgPreparation = function(preparation){
      if( preparation == null ){
        preparation = {
          // ADD
          id: null,
          animal: "",
          type: "",
          protocol: "",
        };
        var edition = false;
      } else {
        // EDIT
        var edition = true;
      }
      ModalService.showModal({
        templateUrl: "preparation/modal_dlg_preparation.tpl.html",
        controller: "ManagePreparationController",
        inputs: {
          title: "preparation information",
          edition: edition,
          preparation: preparation,
        }
      }).then(function(modal) {
        modal.element.modal();
            modal.close.then( function(result) {
              if(result.del_prep == true){
                  $scope.showConfirmRemovePreparation(result.preparation);
              } else {
                  $scope.managePreparation( result.preparation, edition );                    
              }
          });
      });
    };

    $scope.managePreparation = function(preparation, edition){
      angular.element(window).spin();
      $rootScope.spin = 1;
      if(edition == false){
        preparations.post(preparation, function(data){
          $scope.stopSpin();
          $scope.$route.reload();
        });
      } else {
        preparations.put({id:preparation.id}, angular.toJson(preparation), function(){
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

mod_prep.controller('DetailPreparation', ['$scope', '$routeParams', 'preparations', 'animals', 'itemDevices' ,'ModalService', function($scope, $routeParams, preparations, animals, itemDevices, ModalService){
    $scope.prep = preparations.get( {id: $routeParams.eID}, function(prep){
        var animal0 = prep.animal.split('/');
        var idAnimal = animal0[3];
        $scope.animal = animals.get({id:idAnimal}, function(data){
          prep.animal0 = data.identifier;
        });
    });
  }
]);

mod_prep.controller('ManagePreparationController', [
    '$scope', '$element', 'title', 'close', 'edition', 'preparation', 'animals',
    function($scope, $element, title, close, edition, preparation, animals) {
      $scope.preparation = preparation;
      $scope.title = title;
      $scope.lstAnimals = animals.get();


      $scope.beforeClose = function() {
        //console.log($scope.dateFormat);
        if($scope.preparation.animal == ""){
            $scope.msgAlert = "Animal field is required";
        }
        else if($scope.preparation.type == ""){
          $scope.msgAlert = "Type field is required";
        }
        else if($scope.preparation.protocol == ""){
          $scope.msgAlert = "Protocol field must be a number";
        } 
        else {
            $scope.close();
        }
      };

      $scope.delete = function(){
          $scope.del_preparation = true;
          $scope.close();
      };

      $scope.close = function() {
          close({
              preparation: $scope.preparation,
              del_preparation: $scope.del_preparation,
          }, 100); // close, but give 500ms for bootstrap to animate
      };

      //  This cancel function must use the bootstrap, 'modal' function because
      //  the doesn't have the 'data-dismiss' attribute.
      $scope.cancel = function() {
          //  Manually hide the modal.
          $element.modal('hide');
          //  Now call close, returning control to the caller.
          close({
              preparation: $scope.preparation,
          }, 100); // close, but give 500ms for bootstrap to animate
      };

}]);