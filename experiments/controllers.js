'use strict';

/* Controllers */
//if minimizing: ExperimentDetailCtrl.$inject = ['$scope', '$routeParams', 'Experiment'];
var mod_exp = angular.module( 'hermann.experiments', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'ui.bootstrap', 
    'angularModalService',
    'mod_tlv'
    ]);

mod_exp.controller('ListExperiment', [
  '$scope', 'Experiment' ,'ModalService', 'timeLine',
  function($scope, Experiment, ModalService, timeLine, $q){
    $scope.timeLineObj = [];
    var nb_create_timeline = 7;
    $scope.nameTimeLines = ['1 Alfaxan', '2 Esmeron', '3 phys', '4 Env', '5 Electrode', '6 Neuron', '7 Protocol'];
    $scope.colorTimeLine = ['#D5E5FF', '#FFAACC', '#AAFFCC', '#FFEEAA', '#f2f7ff','#f2f7ff', '#f2f7ff'];

    //var defered = $q.defer();

    $scope.experiment = Experiment.get();
    $scope.showDlgAddExperiment = function($http, $q){
      ModalService.showModal({
        templateUrl: "experiments/modal_dlg_add_experiment.tpl.html",
        controller: "AddExperimentController",
        inputs: {
          title: "Experiment information",
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if(result.type == null){
            bootbox.alert("Please choose type to create experiment !");
          } else {
            $scope.createExp(result.label, result.type);

            Experiment.save($scope.expSend, function(value){
              var $dateTL = new Date();
              var $i=0;
              for($i=0; $i<nb_create_timeline; $i++){
                $scope.timeLineObj[$i] = {
                  date : $dateTL,
                  color : $scope.colorTimeLine[$i],
                  name : $scope.nameTimeLines[$i],
                  height : 150,
                  experiment : value.resource_uri // URI of created experiment
                };
              }
            }).$promise.then(function(val) {
              var $i=0;
              angular.forEach($scope.timeLineObj, function(){
                angular.element(window).spin();
                $scope.resource_uri = val.resource_uri;
                timeLine.post($scope.timeLineObj[$i])
                .$promise.then(function(val) {
                  if($i==nb_create_timeline){
                    angular.element('a[href$="#/timeline"]:first').attr("href", app_url + '#/timeline' + $scope.resource_uri)
                  }
                });
                setTimeout(function(){ angular.element(window).spin(); }, 3500);
                $i++;
              });
            });
          }
        });
      });
    };
    $scope.createExp = function($label, $type){
      var $date = new Date();
      var $expSend = {
          label: $label,
          type: $type,
          start: $date,
          note: " ",
          setup: "/devices/setup/1",
          researchers: [$scope.researcher_uri] // à corriger par l'utilisateur courant
      };
      $scope.expSend = $expSend;
      $scope.experiment.objects.push(
        {
          label: $label,
          type: $type,
          start: $date,
          note: " ",
          setup: "/devices/setup/1",
          researchers: [$scope.researcher_uri] // à corriger par l'utilisateur courant
        }
      );
    }
}]);

mod_exp.controller('AddExperimentController', [
  '$scope', '$element', 'title', 'close', 
  function($scope, $element, title, close) {

  $scope.label = null;
  $scope.type = null;
  $scope.title = title;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
    close({
      label: $scope.label,
      type: $scope.type
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function() {

    //  Manually hide the modal.
    $element.modal('hide');
    
    //  Now call close, returning control to the caller.
    close({
      label: $scope.label,
      type: $scope.type
    }, 100); // close, but give 500ms for bootstrap to animate
  };
}]);


//mod_exp.controller('DetailExperiment', ['$scope', '$routeParams', 'Experiment', 'People', 'Preparation', 'Animal' , function($scope, $routeParams, Experiment, People, Preparation, Animal){
mod_exp.controller('DetailExperiment', ['$scope', '$routeParams', 'Experiment', 'People', function($scope, $routeParams, Experiment, People, Preparation, Animal){
    $scope.experiment = Experiment.get( {id: $routeParams.eId}, function(data){
        // when the exp is available, get researchers, to be expanded with another request
        $scope.researchers = new Array;
        $scope.experiment.researchers.forEach( function( entry ){
            var res = People.get( {uri: entry} );
            $scope.researchers.push( res );
        });
        // get preparation
        /*$scope.preparation = Preparation.get({uri:$scope.experiment.preparation}, function(data){
            // when the preparation is available, get the animal and device/items
            $scope.animal = Animal.get({uri:$scope.preparation.animal});
            //$scope.equipment = Device.get({uri:$scope.preparation.equipment});
        });*/
        // get setup
        //$scope.setup = ;
        // populate form from server:
        $scope.master_exp = angular.copy( $scope.experiment ); // default
    });
}]);

mod_exp.controller('EditExperiment', ['$scope', '$http', '$routeParams', 'Experiment', 'People', 'Preparation', 'Animal' , function($scope, $http, $routeParams, Experiment, People, Preparation, Animal){

    DetailExperiment($scope, $routeParams, Experiment, People, Preparation, Animal );
    // TODO: options read from rest
    $scope.exp_type = [
        {id:'1', value:'CAT VISUAL INVIVO INTRA'},
        {id:'2', value:'CAT VISUAL INVIVO EXTRA'},
        {id:'3', value:'CAT VISUAL INVITRO INTRA'},
    ];
    // local update
    $scope.update = function( exp ){
        $scope.master_exp = angular.copy( exp );
        // check if something is changed
        // ...
        // save to server
        $scope.experiment.$save(); // removes trailing slash
    };
    // reset
    $scope.reset = function(){
        $scope.experiment = angular.copy( $scope.master_exp );
    };
    // reset
    $scope.delete = function( exp ){
        //$scope.experiment.$delete();
    };
}]);
