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
    $scope.nameTimeLines = ['1 Anesthetic', '2 Paralytic', '3 Physiologic', '4 Environment', '5 Electrode', '6 Neuron', '7 Protocol'];
    $scope.colorTimeLine = ['#D5E5FF', '#FFAACC', '#AAFFCC', '#FFEEAA', '#f2f7ff','#f2f7ff', '#f2f7ff'];
    var default_lab_date = new Date();
    var default_lab_year = default_lab_date.format('yyyy');

    $scope.getWeekNumber = function(d){
        // Copy date so don't modify original
        d = new Date(+d);
        d.setHours(0,0,0);
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setDate(d.getDate() + 4 - (d.getDay()||7));
        // Get first day of year
        var yearStart = new Date(d.getFullYear(),0,1);
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
        // Return array of year and week number
        //return [d.getFullYear(), weekNo];
        return [weekNo];
    };

    var default_lab_week = $scope.getWeekNumber(default_lab_date);

    $scope.experiment = Experiment.get();
    $scope.showDlgAddExperiment = function($http, $q){
      ModalService.showModal({
        templateUrl: "experiments/modal_dlg_add_experiment.tpl.html",
        controller: "AddExperimentController",
        inputs: {
          title: "Experiment information",
          default_label: default_lab_year + " " + default_lab_week,
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if(result.type == null){
            bootbox.alert("Please choose type to create experiment !");
          } else {

            $scope.createExp(result.label, result.type, result.notes, result.setup);
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
                    $scope.experiment = Experiment.get();//reload experiments
                    //angular.element('a[href$="#/timeline"]:first').attr("href", app_url + '#/timeline' + $scope.resource_uri);
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

    $scope.createExp = function($label, $type, $notes, $setup){
      var $date = new Date();
      var $expSend = {
          label: $label,
          type: $type,
          start: $date,
          notes: $notes,
          setup: $setup,
          researchers: [$scope.researcher_uri] // à corriger par l'utilisateur courant
      };
      $scope.expSend = $expSend;
      $scope.experiment.objects.push(
        {
          label: $label,
          type: $type,
          start: $date,
          notes: $notes,
          setup: $setup,
          researchers: [$scope.researcher_uri], // à corriger par l'utilisateur courant
        }
      );
    };

    $scope.showDlgEditExperiment = function($exp_uri){
        ModalService.showModal({
        templateUrl: "experiments/modal_dlg_edit_experiment.tpl.html",
        controller: "EditExperimentController",
        inputs: {
          title: "Experiment information",
          exp_uri: $exp_uri,
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if(result.type == null){
            bootbox.alert("Please choose type to save experiment !");
          } else {
            $scope.editExperiment($exp_uri, result.label, result.type, result.notes, result.setup);

            var $nCol = $exp_uri.split('/');
            var id_exp = $nCol[2];
            $scope.jsonNewLabel = '{ "label" : "'+result.label+'", "type": "'+result.type+'", "notes": "'+result.notes+'", "setup": "'+result.setup+'"}';
            Experiment.patch({id:id_exp}, $scope.jsonNewLabel, function(value){});
          }
        });
      });
    };

    $scope.editExperiment = function($exp_uri, $label, $type, $notes, $setup){
      angular.forEach($scope.experiment.objects, function(value, key) {
        if(value.resource_uri == $exp_uri){
          $scope.experiment.objects[key].label = $label;
          $scope.experiment.objects[key].type = $type;
          $scope.experiment.objects[key].notes = $notes;
          $scope.experiment.objects[key].setup = $setup;
        }
      });
    };
}]);

mod_exp.controller('AddExperimentController', [
  '$scope', '$element', 'title', 'default_label', 'close', 'Setup', 
  function($scope, $element, title, default_label, close, Setup) {

  $scope.lstSetup = Setup.get();

  $scope.label = default_label;
  $scope.type = null;
  $scope.notes = null;
  $scope.setup = null;
  $scope.title = title;

  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.beforeClose = function() {
    if(($scope.label == "") | ($scope.label == null)) {
      $scope.msgAlert = "Please enter label to create experiment !";
    } else {
      if($scope.type == null){
        $scope.msgAlert = "Please choose type to create experiment !";
      } else {
        if($scope.setup == null){
          $scope.msgAlert = "Please choose setup to create experiment !";
        } else {
          $scope.close();
        }
      }
    }
  };

  $scope.close = function() {
    close({
      label: $scope.label,
      type: $scope.type,
      notes: $scope.notes,
      setup: $scope.setup
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
      type: $scope.type,
      notes: $scope.notes,
      setup: $scope.setup
    }, 100); // close, but give 500ms for bootstrap to animate
  };
}]);

mod_exp.controller('EditExperimentController', [
  '$scope', '$routeParams', 'Experiment', 'Setup',  '$element', 'exp_uri', 'title', 'close',
  function($scope, $routeParams, Experiment, Setup, $element, exp_uri, title, close) {
    $scope.lstSetup = Setup.get();
    $scope.experiment = Experiment.get( {id: $routeParams.eId}, function(data){
      angular.forEach($scope.experiment.objects, function(value, key) {
        if(value.resource_uri == exp_uri){
          $scope.label = value.label;
          $scope.type = value.type;
          $scope.notes = value.notes;
          $scope.setup = value.setup;
        }
      });
      $scope.title = title;
    });


  $scope.beforeClose = function() {
    $scope.close();
  };
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
    close({
      label: $scope.label,
      type: $scope.type,
      notes: $scope.notes,
      setup: $scope.setup
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
      type: $scope.type,
      notes: $scope.notes,
      setup: $scope.setup
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
