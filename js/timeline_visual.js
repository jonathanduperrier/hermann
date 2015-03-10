var app = angular.module('myapp', ['ui.bootstrap', 'angularModalService']).controller('mainController', function ($scope, $compile, ModalService) {
    var number=1;
    var nbEvent = [];
    var timeLineObj = [];

    $scope.showDlgAddTimeLine = function(){
      ModalService.showModal({
        templateUrl: "templates/modal_dlg_add_timeline.html",
        controller: "AddTimeLineController",
        inputs: {
          title: "Event information",
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if(result.name == null){
            bootbox.alert("Please enter the name this timeline !");
          } else {
            $scope.addTimeline(result.name);
          }
        });
      });
    }

    $scope.addTimeline = function($name){
        var datetimeCol = new Date();
        var randColor = '#'+Math.floor(Math.random()*16777215).toString(16);

        //création objet
        timeLineObj[number] = {
          id : number,
          date : datetimeCol,
          color : randColor,
          name : $name,
          event : {}
        };
        $scope.timeLineObj = timeLineObj;
        nbEvent[number] = 1;
        number+=1;
    };

    $scope.showConfirmRemoveTimeline = function($numberCol) {
        ModalService.showModal({
            templateUrl: 'templates/modal_confirm_remove_timeline.html',
            controller: "ModalController"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result=="Yes") {
                    //angular.element('.event').css("display", "none");
                    $scope.removeTimeline($numberCol);
                }
            });
        });
    };

    $scope.removeTimeline = function($numberCol){
       angular.element('#timeline_' + $numberCol).remove();
       delete timeLineObj[$numberCol];
       //angular.element('.event').css("display", "block") ;
       angular.element('.event').css("transform : ", "translateX(90px) translateY(0)") ;
    };

    $scope.showDlgAddEvent = function($numberCol, $date){
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
            $scope.addEvent($numberCol, result.text, $date, result.type);
          }
        });
      });
    };

    $scope.addEvent = function($numberCol, $text, $date, $type){
        var $dateEvent = new Date();
        var $randColor = '#'+Math.floor(Math.random()*16777215).toString(16);
        var $vPlInit = $date/1e3|0; //date of timeline
        var $vPl = $dateEvent/1e3|0;
        
        $vPlacement = $vPl - $vPlInit;

        timeLineObj[$numberCol].event[nbEvent[$numberCol]] = {
            id : nbEvent[$numberCol],
            text : $text,
            date : $dateEvent,
            type : $type,
            color : $randColor,
            vPlacement : $vPlacement
        }
        $vLimitTimeline = $vPlacement+200;

        angular.element("#timeline_" + $numberCol).css("height", $vLimitTimeline.toString()+"px") ;
        nbEvent[$numberCol]+=1;
    };

    $scope.showConfirmRemoveEvent = function($numberCol, $nbEvent) {
        ModalService.showModal({
            templateUrl: 'templates/modal_confirm_remove_event.html',
            controller: "ModalController"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result=="Yes") {
                    $scope.removeEvent($numberCol, $nbEvent);
                }
            });
        });
    };
    $scope.removeEvent = function($numberCol, $nbEvent){
        angular.element('#event_' + $numberCol + '_' + $nbEvent).remove();
        delete timeLineObj[$numberCol].event[$nbEvent];
    };
    $scope.syncJSON = function() {
        $scope.jsonContent = angular.toJson(timeLineObj);
    };
    $scope.mouseOverEvent = function($timeline_id, $event_id) {
        angular.element("#event_" + $timeline_id + "_" + $event_id).css("z-index", "10");
    };
    $scope.mouseLeaveEvent = function($timeline_id, $event_id) {
        angular.element("#event_" + $timeline_id + "_" + $event_id).css("z-index", "0");
    }
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

