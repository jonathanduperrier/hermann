var app = angular.module('myapp', ['ui.bootstrap', 'angularModalService', 'timeLineServices', 'eventServices']).controller('mainController', function ($scope, $compile, ModalService, $http, timeLine, events) {
    $scope.nbEvent = [];
    $scope.timeLineObj = [];
    $scope.eventObj = [];
    $scope.djangoAuth = "username=jonathan&username=jonathan&api_key=e8op8ezrahuireuihreazhuiiu"

    $scope.showDlgAddTimeLine = function(){
      ModalService.showModal({
        templateUrl: "templates/modal_dlg_add_timeline.html",
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
        //$scope.addTimeline($name, $scope.timeLineObj.length+1, datetimeCol, randColor, 150);
        if($scope.timeLineObj.length < 1) {
          $id = 1;
        }
        else {
          angular.forEach($scope.timeLineObj, function(value){
            if($scope.timeLineObj.id > $id){
              $id = $scope.timeLineObj.id;
            }
          });
          $id++;
        }
        $scope.addTimeline($name, $id, datetimeCol, randColor, 150);
    };

    $scope.addTimeline = function($name, $id, $date, $color, $height){
        //création objet
        $scope.timeLineObj.push(
          {
            id : $id,
            date : $date,
            color : $color,
            name : $name,
            height : $height
          }
        );
    };

    $scope.showConfirmRemoveTimeline = function($numberCol) {
        ModalService.showModal({
            templateUrl: 'templates/modal_confirm_remove_timeline.html',
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
        templateUrl: "templates/modal_dlg_add_event.html",
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
        var $dateFormat = $dateEvent.format('mm/dd/yyyy - hh:MM');
        if($scope.px_sec>=1){
            $vPlacement = ($vPl - $vPlInit)/$scope.px_sec;
        } else {
            $vPlacement = $vPl - $vPlInit;
        }
        if($vPlacement < 0) {
          $vPlacement = 0;
        }
        $scope.addEvent($numberCol, $text, $dateEvent, $dateFormat, $type, $randColor, $vPlacement);
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
        angular.forEach($scope.timeLineObj, function($value, $key){
          if($scope.timeLineObj.id = $numberCol){
            $scope.timeLineObj[$key].height = $vPlacement+150;
          }
        });

        $scope.eventObj.push (
            {
                id : $idEvent,
                timeline : "/notebooks/timeline/" + $numberCol,
                text : $text,
                date : $dateEvent,
                dateFormat : $dateFormat,
                type : $type,
                color : $randColor,
                vPlacement : $vPlacement
            }
        );
    };

    $scope.showConfirmRemoveEvent = function($nbEvent) {
        ModalService.showModal({
            templateUrl: 'templates/modal_confirm_remove_event.html',
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
    };

    $scope.toJSON = function() {
        $scope.toJsonTimeLine();
        $scope.toJsonEvent();
    };

    $scope.toJsonTimeLine = function() {
        $scope.jsonContentTimeLine = '{ "objects" : ' + angular.toJson($scope.timeLineObj) + '}';
        timeLine.put($scope.jsonContentTimeLine, function(){
          return true;
        });     
    };
    $scope.toJsonEvent = function() {
        $scope.jsonContentEvent = '{ "objects" : ' + angular.toJson($scope.eventObj) + '}';
        events.put($scope.jsonContentEvent, function(){
          return true;
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
                    $scope.addTimeline(value.name, value.id, value.date, value.color, value.height);
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
              $dateFormat = $dateEvt.format('mm/dd/yyyy - hh:MM');
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

app.controller('ModalController', function($scope, close) {
  $scope.close = function(result) {
    close(result, 100); // close, but give 500ms for bootstrap to animate
  };
});

app.directive('timeLineDir', function(){
  return {
    templateUrl: 'templates/timeline.html'
  };
});

app.directive('eventDir', function(){
  return {
    templateUrl: 'templates/event.html'
  };
});

app.controller('AddTimeLineController', [
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

app.controller('AddEventController', [
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

