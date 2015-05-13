
var mod_tlv = angular.module('mod_tlv', ['ui.bootstrap', 
                                         'angularModalService', 
                                         'timeLineServices', 
                                         'eventServices',
                                         'hermann.experiments'
                                         ]);
mod_tlv.controller('timeLineVisualController', 
function ($scope, $compile, ModalService, $http, timeLine, events, $routeParams, Experiment) {
    $scope.nbEvent = [];
    $scope.timeLineObj = [];
    $scope.eventObj = [];
    $scope.$routeParams = $routeParams;

    $scope.idExp = 0;
    $scope.experiment = Experiment.get({id: $routeParams.eId}, function(data){
      //data.object
      angular.forEach(data.object, function($value){
        if($value.id.toString() == $routeParams.eId){
          $scope.idExp = value.id;
        }
      });
    });


    $scope.showDlgAddTimeLine = function(){
      ModalService.showModal({
        templateUrl: "timeline/modal_dlg_add_timeline.tpl.html",
        controller: "AddTimeLineController",
        inputs: {
          title: "Timeline information",
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if(result.name == null){
            bootbox.alert("Please enter the name this timeline !");
          } else {
            $scope.createTimeLine(result.name);
          }
        });
      });
    };

    $scope.createTimeLine = function ($name) {
        var datetimeCol = new Date();
        var randColor = '#'+Math.floor(Math.random()*16777215).toString(16);
        
        $id = 0;
        
        if($scope.timeLineObj.length < 1) {
          $id = 1;
        }
        else {
          angular.forEach($scope.timeLineObj, function($value){
            if($value.id > $id){
              $id = $value.id;
            }
          });
          $id++;
        }
        $scope.addTimeline($name, $id, datetimeCol, randColor, 150);
    };

    $scope.addTimeline = function($name, $id, $date, $color, $height){
        $scope.dateLastTimeLine = $date;
        $displayEpoch = 0;
        //reading display_epoch_btn.json to determine to display add epoch button
        angular.element.getScript( "timeline/dict/display_epoch_btn.js");
        angular.forEach(display_epoch_btn, function(value, key) {
          if(display_epoch_btn[key].name == $name){
            $displayEpoch = display_epoch_btn[key].displayEpoch;
          }
        });

        //creation of object
        $scope.timeLineObj.push(
          {
            id : $id,
            date : $date,
            color : $color,
            name : $name,
            height : $height,
            experiment : "/experiment/" + $routeParams.eID,
            displayEpoch : $displayEpoch,
          }
        );
        angular.element("#graduation").height($height-60);
    };

    $scope.showConfirmRemoveTimeline = function($numberCol) {
        ModalService.showModal({
            templateUrl: 'timeline/modal_confirm_remove_timeline.tpl.html',
            controller: "ModalController"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result=="Yes") {
                    $scope.removeTimeline($numberCol);
                }
            });
        });
    };

    $scope.removeTimeline = function($numberCol){
       angular.element('#timeline_' + $numberCol).remove();
        angular.forEach($scope.timeLineObj, function($value, $key) {
          if($value.id == $numberCol){
            $scope.timeLineObj.splice($key, 1);
          }
        });
    };

    $scope.showDlgAddEvent = function($numberCol, $date){
      $date = new Date($date);
      ModalService.showModal({
        templateUrl: "timeline/modal_dlg_add_event.tpl.html",
        controller: "AddEventController",
        inputs: {
          title: "Event information",
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if(result.type == null){
            bootbox.alert("Please choose type to create event !");
          } else {
            $scope.createEvent($numberCol, result.text, $date, result.type);
          }
        });
      });
    };

    $scope.createEvent = function($numberCol, $text, $date, $type){
        var $dateEvent = new Date();
        var $vPlInit = $date/1e3|0; //date of timeline
        var $vPl = $dateEvent/1e3|0; 
        var $dateFormat = $dateEvent.format('mm/dd/yyyy - HH:MM');

        $vPlacement = (($vPl - $vPlInit)/120); //1px = 60 secondes /2?
        $scope.addEvent($numberCol, $text, $dateEvent, $dateFormat, $type, $vPlacement);
        $scope.toJSON();
    };

    $scope.addEvent = function($numberCol, $text, $dateEvent, $dateFormat, $type, $vPlacement){
        if(angular.element.isEmptyObject($scope.eventObj)) {
          $idEvent = 1;
        } else {
          angular.forEach($scope.eventObj, function(value){
            if($scope.eventObj.id > $idEvent){
              $idEvent = $scope.eventObj.id;
            }
          });
          $idEvent++;
        }
        var $i=0;
        var $TLexp = "";
        var $TLcolor = "";
        angular.forEach($scope.timeLineObj, function($value, $key){
          if($numberCol == $scope.timeLineObj[$key].id){
            $TLexp = $scope.timeLineObj[$key].experiment;
            $TLcolor = $scope.timeLineObj[$key].color;
          }
          if(($vPlacement+150) > $scope.timeLineObj[$key].height){
            $scope.timeLineObj[$key].height = $vPlacement+150;
            angular.element("#graduation").height($vPlacement+150);
          }
          $i++;
        });        
        $scope.eventObj.push (
            {
                id : $idEvent,
                timeline : "/notebooks/timeline/" + $numberCol,
                text : $text,
                date : $dateEvent,
                dateFormat : $dateFormat,
                type : $type,
                color : "#FFFFFF",
                vPlacement : $vPlacement,
                TimeLineExp : '#/timeline' + $TLexp,
                UrlExp : window.location.hash,
                TimeLineColor : $TLcolor,
            }
        );
    };

    $scope.showConfirmRemoveEvent = function($nbEvent) {
        ModalService.showModal({
            templateUrl: 'timeline/modal_confirm_remove_event.tpl.html',
            controller: "ModalController"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result=="Yes") {
                    $scope.removeEvent($nbEvent);
                }
            });
        });
    };

    $scope.removeEvent = function($nbEvent){
        angular.element('#event_' + $nbEvent).remove();        
        angular.forEach($scope.eventObj, function($value, $key) {
          if($value.id == $nbEvent){
            $scope.eventObj.splice($key, 1);
          }
        });
        $scope.toJSON();
    };

    $scope.showDlgEditEvent = function($nbEvent, $date){
      $date = new Date($date);
      //récupérer l'event correspondant ($nbEvent = id) dans $scope.eventObj
      angular.forEach($scope.eventObj, function(value, key) {
        if(value.id == $nbEvent){
          $evt_id = value.id,
          $evt_text = value.text;
          $evt_type = value.type;
          $evt_date = value.date;
        }
      });

      ModalService.showModal({
        templateUrl: "timeline/modal_dlg_edit_event.tpl.html",
        controller: "EditEventController",
        inputs: {
          title: "Edit Event information",
          evt_id: $evt_id,
          evt_text: $evt_text,
          evt_type: $evt_type,
          evt_date: $evt_date,
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if(result.del_evt == true){
            $scope.showConfirmRemoveEvent($evt_id);
          } else {
            if(result.type == null){
              bootbox.alert("Please choose type to save event !");
            } else {
              from_date = result.evt_date.split("/");
              to_date = new Date(from_date[1]+"/"+from_date[0]+"/"+from_date[2]);
              $scope.editEvent($nbEvent, result.text, to_date, result.type);
              $scope.toJSON();
            }
          }
        });
      });
    };
    $scope.editEvent = function($id, $text, $date, $type){
      angular.forEach($scope.eventObj, function(value, key) {
        if(value.id == $id){
          $scope.eventObj[key].text = $text;
          $scope.eventObj[key].date = $date;
          $scope.eventObj[key].dateFormat = $date.format('dd/mm/yyyy - HH:MM');
          $scope.eventObj[key].type = $type;
        }
      });
    };

    $scope.toJSON = function() { //convert object to JSON and save it in database
        var id_exp = $routeParams.eID;
        var $prevJSONContentEvent = '';

        $scope.jsonContentTimeLine = '{ "objects" : ' + angular.toJson($scope.timeLineObj) + '}';
        $scope.jsonContentEvent = '{ "objects" : ' + angular.toJson($scope.eventObj) + '}';
        
        timeLine.put({experiment__id:id_exp}, $scope.jsonContentTimeLine , function(){}).$promise.then(function(val) {
          events.put( $scope.jsonContentEvent, function(){});
        });
    };

    $scope.fromJSON = function() {
      $scope.fromJsonTimeLine();
    };

    $scope.fromJsonTimeLine = function () {
        $scope.TLExp = [];
        $scope.response = timeLine.get({}, function(data){
          $jsonTimelines = angular.fromJson(data.objects);
          $i=0;
          angular.forEach($jsonTimelines, function(value, key) {
                if(value != null){
                    if(value.experiment == '/experiment/'+$routeParams.eID) {
                      $scope.addTimeline(value.name, value.id, value.date, value.color, value.height);
                      $scope.TLExp[$i] = value.resource_uri;
                      $i++;
                    }
                }
            });
          $scope.fromJsonEvent(1);
        });
    };
    $scope.displayZoomEvent = function ($scale) {
      angular.element('.event').remove();
      $scope.eventObj = [];
      $scope.fromJsonEvent($scale);
    };
    $scope.fromJsonEvent = function ($scale) {
        $scope.response = events.get({}, function(data){
        $jsonEvents = angular.fromJson(data.objects);
        $timeStampEvtMax = 0;
        $timeStampEvtMin = 0;
        $diffTSEvt = [];
        switch($scale){
          case 0:
            $scl_coef = 1;
            break;
          case 1:
            $scl_coef = 60;
            break;
          case 2:
            $scl_coef = 3600;
            break;
        }
        $i=0;
        angular.forEach($jsonEvents, function(value, key) {
          if($scope.TLExp.indexOf(value.timeline) != -1){
            $dateEvt = new Date(value.date);
            if(($timeStampEvtMin > $dateEvt.valueOf()) || ( $timeStampEvtMin == 0)){
              $timeStampEvtMin = $dateEvt.valueOf();
            }
            if($timeStampEvtMax < $dateEvt.valueOf()){
              $timeStampEvtMax = $dateEvt.valueOf();
            }
            $diffTSEvt[$i] = (($timeStampEvtMax/1e3|0) - ($timeStampEvtMin/1e3|0))/$scl_coef; ///60
          } else {
            $diffTSEvt[$i] = 0;
          }
          $i++;
        });
        $j=0;
        angular.forEach($jsonEvents, function(value, key) {
          if( value != null ){
              $nCol = value.timeline.split('/');
              $numberCol = $nCol[3];
              $dateEvt = new Date(value.date);
              $dateFormat = $dateEvt.format('mm/dd/yyyy - HH:MM');
              //$numberCol, $text, $dateEvent, $dateFormat, $type, $randColor, $vPlacement
              $scope.addEvent($numberCol, value.text, $dateEvt, $dateFormat, value.type, $diffTSEvt[$j]);
          }
          $j++;
        });
      });
    };

    $scope.eventZIndex = function($event_id) {
        angular.element(".event").css("z-index", "0");
        angular.element(".event_" + $event_id).css("z-index", "10");
    };

    $scope.toogleEvtLeft = function() {
      angular.element(".textEventLeft").slideToggle(500);
    };
});

mod_tlv.controller('ModalController', function($scope, close) {
  $scope.close = function(result) {
    close(result, 100); // close, but give 500ms for bootstrap to animate
  };
});

mod_tlv.directive('timeLineDir', function(){
  return {
    templateUrl: 'timeline/timeline.tpl.html'
  };
});

mod_tlv.directive('eventDir', function(){
  return {
    templateUrl: 'timeline/event.tpl.html'
  };
});

mod_tlv.controller('AddTimeLineController', [
  '$scope', '$element', 'title', 'close', 
  function($scope, $element, title, close) {

  $scope.name = null;
  $scope.title = title;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
    close({
      name: $scope.name
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function() {

    //  Manually hide the modal.
    $element.modal('hide');
    
    //  Now call close, returning control to the caller.
    close({
      name: $scope.name
    }, 100); // close, but give 500ms for bootstrap to animate
  };
}]);

mod_tlv.controller('AddEventController', [
  '$scope', '$element', 'title', 'close', 
  function($scope, $element, title, close) {

  $scope.text = null;
  $scope.date = null;
  $scope.type = null;
  $scope.title = title;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
    close({
      text: $scope.text,
      date: $scope.date,
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
      text: $scope.text,
      date: $scope.date,
      type: $scope.type
    }, 100); // close, but give 500ms for bootstrap to animate
  };
}]);

mod_tlv.controller('EditEventController', [
  '$scope', '$element', 'title', 'evt_text', 'evt_type', 'evt_date', 'evt_id', 'close', 
  function($scope, $element, title, evt_text, evt_type, evt_date, evt_id, close) {

  $scope.text = evt_text;
  $scope.evt_id = evt_id;
  $scope.evt_date = evt_date.format('dd/mm/yyyy HH:MM');
  $scope.type = evt_type;
  $scope.title = title;
  $scope.del_evt = false;

  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  //$date = new Date($date);
  $scope.close = function() {
    close({
      text: $scope.text,
      evt_date: angular.element('#evt_date_'+$scope.evt_id).val(),
      type: $scope.type,
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
      text: $scope.text,
      evt_date: angular.element('#evt_date_'+$scope.evt_id).val(),
      type: $scope.type,
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  $scope.delete = function(){
    $scope.del_evt = true;
    $scope.close();
  };

  $scope.disableTimeStamp = function($evt_id) {
    angular.element("#evt_date_"+$evt_id).prop('disabled', true);
  };

  $scope.enableTimeStamp = function($evt_id) {
    angular.element("#evt_date_"+$evt_id).prop('disabled', false);
  };

  $scope.displayDatePicker = function($evt_id) {
    angular.element('#datetimepicker_'+$evt_id).datetimepicker({
        locale: 'en-gb'
    });
  };
}]);
