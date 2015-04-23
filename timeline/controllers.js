
var mod_tlv = angular.module('mod_tlv', ['ui.bootstrap', 'angularModalService', 'timeLineServices', 'eventServices']).controller('timeLineVisualController', function ($scope, $compile, ModalService, $http, timeLine, events, $routeParams) {
    $scope.nbEvent = [];
    $scope.timeLineObj = [];
    $scope.eventObj = [];
    $scope.$routeParams = $routeParams;

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
        //creation of object
        $scope.timeLineObj.push(
          {
            id : $id,
            date : $date,
            color : $color,
            name : $name,
            height : $height,
            experiment : "/experiment/" + $routeParams.eID
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
        var $randColor = '#'+Math.floor(Math.random()*16777215).toString(16);
        var $vPlInit = $date/1e3|0; //date of timeline
        var $vPl = $dateEvent/1e3|0;
        var $dateFormat = $dateEvent.format('mm/dd/yyyy - HH:MM');

        $vPlacement = (($vPl - $vPlInit)/60); //1px = 60 secondes
        $scope.addEvent($numberCol, $text, $dateEvent, $dateFormat, $type, $randColor, $vPlacement);
        $scope.toJSON();
    };

    $scope.addEvent = function($numberCol, $text, $dateEvent, $dateFormat, $type, $randColor, $vPlacement){
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
        angular.forEach($scope.timeLineObj, function($value, $key){
          //if($scope.timeLineObj[$i].id == $numberCol){
            if(($vPlacement+150) > $scope.timeLineObj[$key].height){
              $scope.timeLineObj[$key].height = $vPlacement+150;
              angular.element("#graduation").height(($vPlacement+150)-60);
            }
          //}
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
                //color : $randColor,
                color : "#FFFFFF",
                vPlacement : $vPlacement
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

    $scope.toJSON = function() { //convert object to JSON and save it in database
        var id_exp = $routeParams.eID;
        var $prevJSONContentEvent = '';

        $scope.jsonContentTimeLine = '{ "objects" : ' + angular.toJson($scope.timeLineObj) + '}';
        $scope.jsonContentEvent = '{ "objects" : ' + angular.toJson($scope.eventObj) + '}';
        
        timeLine.put({experiment__id:id_exp}, $scope.jsonContentTimeLine , function(){}).$promise.then(function(val) {
          //var $j=0;
          //angular.forEach($scope.timeLineObj, function(){
            //var id_tl = $scope.timeLineObj[$j].id;
            //if($prevJSONContentEvent != $scope.jsonContentEvent){ //avoid duplicate entry
              //events.put({timeline__id:id_tl}, $scope.jsonContentEvent, function(){});
              events.put( $scope.jsonContentEvent, function(){});
            //}
            //$prevJSONContentEvent = $scope.jsonContentEvent;
            //$j++;
          //});
        });
    };

    $scope.fromJSON = function() {
      $scope.fromJsonTimeLine();
      $scope.fromJsonEvent();
    };

    $scope.fromJsonTimeLine = function () {
        $scope.response = timeLine.get({}, function(data){
          $jsonTimelines = angular.fromJson(data.objects);
          angular.forEach($jsonTimelines, function(value, key) {
                if(value != null){
                    if(value.experiment == '/experiment/'+$routeParams.eID) {
                      $scope.addTimeline(value.name, value.id, value.date, value.color, value.height);
                    }
                }
            });
        });
        
    };
    
    $scope.fromJsonEvent = function () {
        $scope.response = events.get({}, function(data){
        $jsonEvents = angular.fromJson(data.objects);
        angular.forEach($jsonEvents, function(value, key) {
          if(value != null){
              $nCol = value.timeline.split('/');
              $numberCol = $nCol[3];
              $dateEvt = new Date(value.date);
              $dateFormat = $dateEvt.format('mm/dd/yyyy - HH:MM');
              //$numberCol, $text, $dateEvent, $dateFormat, $type, $randColor, $vPlacement
              $scope.addEvent($numberCol, value.text, $dateEvt, $dateFormat, value.type, value.color, value.vPlacement);
          }
        });
      });
    };

    $scope.eventZIndex = function($event_id) {
        angular.element(".event").css("z-index", "0");
        angular.element(".event_" + $event_id).css("z-index", "10");
    };
    $scope.changeScaleEvents = function(){
        $scope.px_sec = $scope.displayScaleEvents;
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
