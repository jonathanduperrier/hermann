var app = angular.module('myapp', ['ui.bootstrap', 'angularModalService']).controller('mainController', function ($scope, $compile, ModalService) {
    $scope.nbEvent = [];
    $scope.timeLineObj = [];

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

        $scope.addTimeline($name, $scope.timeLineObj.length+1, datetimeCol, randColor, 150);
    };

    $scope.addTimeline = function($name, $id, $date, $color, $height){
        //création objet
        $scope.timeLineObj.push( {
          id : $id,
          date : $date,
          color : $color,
          name : $name,
          event : {},
          height : $height
        } );
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
       delete $scope.timeLineObj[$numberCol-1];
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
        $scope.addEvent($numberCol, $text, $dateEvent, $dateFormat, $type, $randColor, $vPlacement);
    };

    $scope.addEvent = function($numberCol, $text, $dateEvent, $dateFormat, $type, $randColor, $vPlacement){
        if(angular.element.isEmptyObject($scope.timeLineObj[$numberCol-1].event)) {
          $idEvent = 1;
        } else {
          $idEvent = (angular.element($scope.timeLineObj[$numberCol-1].event).size())+1;
        }
        $scope.timeLineObj[$numberCol-1].height = $vPlacement+150;
        $scope.timeLineObj[$numberCol-1].event[$idEvent] = {
            id : $idEvent,
            text : $text,
            date : $dateEvent,
            dateFormat : $dateFormat,
            type : $type,
            color : $randColor,
            vPlacement : $vPlacement
        }
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
        delete $scope.timeLineObj[$numberCol-1].event[$nbEvent];
    };
    $scope.toJSON = function() {
        $scope.jsonContent = angular.toJson($scope.timeLineObj);
    };
    $scope.fromJSON = function() {
        //$stringJSONTest = '[null,{"id":1,"date":"2015-03-11T16:30:18.263Z","color":"#6b96fa","name":"euz ru ioezar reiaoz uirezoa","event":{"1":{"id":1,"text":"rez rezaio reziour ezaio urezio","date":"2015-03-11T16:30:36.126Z","dateFormat":"03/11/2015 - 05:30","type":"Type 3","color":"#7246b0","vPlacement":18},"2":{"id":2,"text":"etzat","date":"2015-03-11T16:30:56.838Z","dateFormat":"03/11/2015 - 05:30","type":"Type 3","color":"#81bd30","vPlacement":38}}},{"id":2,"date":"2015-03-11T16:30:23.415Z","color":"#3f0c29","name":"ioerzu eruioz uirez ureizou irzeoret","event":{"1":{"id":1,"text":"reza zearuio reziou erzerza","date":"2015-03-11T16:30:50.895Z","dateFormat":"03/11/2015 - 05:30","type":"Type 3","color":"#6f44f5","vPlacement":27},"2":{"id":2,"text":"fsdf sfd sdgfdgd","date":"2015-03-11T16:31:18.080Z","dateFormat":"03/11/2015 - 05:31","type":"Type 3","color":"#8bd2f2","vPlacement":55}}},{"id":3,"date":"2015-03-11T16:30:28.941Z","color":"#7cc1a6","name":"ezr irezuiop rezuoi rueoziau rezoia","event":{"1":{"id":1,"text":"rez erzçua reuioaz rueizoaireozareza","date":"2015-03-11T16:30:43.959Z","dateFormat":"03/11/2015 - 05:30","type":"Type 3","color":"#6066a8","vPlacement":15},"2":{"id":2,"text":"gdfsgs gf !dçp gfduiogdfs gf","date":"2015-03-11T16:31:26.013Z","dateFormat":"03/11/2015 - 05:31","type":"Type 4","color":"#a3ed7d","vPlacement":58}}}]';
        $stringJSONTest = '[{"id":1,"date":"2015-03-12T13:55:00.747Z","color":"#e3a14a","name":"rezaerzvdv cvdfsgerzbv cvxvcxb01","event":{"1":{"id":1,"text":"hgf","date":"2015-03-12T13:55:22.532Z","dateFormat":"03/12/2015 - 02:55","type":"Type 4","color":"#106a7c","vPlacement":22},"2":{"id":2,"text":"fds","date":"2015-03-12T13:55:39.776Z","dateFormat":"03/12/2015 - 02:55","type":"Type 4","color":"#4f2039","vPlacement":39}}},{"id":2,"date":"2015-03-12T13:55:07.145Z","color":"#e8e6d8","name":"ifsduiyo dsqfi odfs upiofdqs02","event":{"1":{"id":1,"text":"oiuytr tyuiop","date":"2015-03-12T13:55:30.313Z","dateFormat":"03/12/2015 - 02:55","type":"Type 4","color":"#382ded","vPlacement":23},"2":{"id":2,"text":"hfg vbncnb  hg","date":"2015-03-12T13:56:01.171Z","dateFormat":"03/12/2015 - 02:56","type":"Type 1","color":"#af9436","vPlacement":54}}},{"id":3,"date":"2015-03-12T13:55:12.108Z","color":"#3573f0","name":"fds sfd uiofs duio 03","event":{"2":{"id":2,"text":"jghnb","date":"2015-03-12T13:55:49.113Z","dateFormat":"03/12/2015 - 02:55","type":"Type 3","color":"#70acc3","vPlacement":37}}}]';
        $jsonTimelines = angular.fromJson($stringJSONTest);
        angular.forEach($jsonTimelines, function(value, key) {
            if(value != null){
                $scope.addTimeline(value.name, value.id, value.date, value.color, 150);
                angular.forEach(value.event, function(evtVal, evtKey) {
                    $scope.addEvent(value.id, evtVal.text, evtVal.date, evtVal.dateFormat, evtVal.type, evtVal.color, evtVal.vPlacement);
                });
            }
        });
        $stringJSONTest = '';
    };
    $scope.eventZIndex = function($timeline_id, $event_id) {
        angular.element(".event").css("z-index", "0");
        angular.element("#event_" + $timeline_id + "_" + $event_id).css("z-index", "10");
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

