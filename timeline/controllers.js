
var mod_tlv = angular.module('mod_tlv', ['ui.bootstrap', 
                                         'angularModalService', 
                                         'timeLineServices', 
                                         'eventServices',
                                         'epochServices',
                                         'electrodeServices',
                                         'neuronServices',
                                         'protocolServices',
                                         'hermann.experiments'
                                         ]);
mod_tlv.controller('timeLineVisualController', 
function ($scope, $rootScope, $compile, ModalService, $http, timeLine, events, epoch, electrode, neuron, protocol, $routeParams, Experiment) {
    $scope.nbEvent = [];
    $scope.timeLineObj = [];
    $scope.eventObj = [];
    $scope.epochObj = [];
    $scope.electrodeObj = [];
    $scope.neuronObj = [];
    $scope.protocolObj = [];
    $rootScope.electrodeObj = [];
    $rootScope.neuronObj = [];
    $rootScope.protocolObj = [];

    $scope.$routeParams = $routeParams;

    $scope.idExp = 0;
    $scope.dateStartExp = "";
    $scope.dateEndExp = "";


    $scope.experiment = Experiment.get({id: $routeParams.eID}, function(data){
      //data.object
      angular.forEach(data.objects, function($value){
        if($value.id.toString() == $routeParams.eID){
          $scope.idExp = $value.id;
          $dateStartExp = new Date($value.start);
          $scope.dateStartExp = $dateStartExp.format('mm/dd/yyyy - HH:MM');

          $dateEndExp = new Date($value.end);
          if($value.end!=null){
            $scope.dateEndExp = $dateEndExp.format('mm/dd/yyyy - HH:MM');
          }
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

        $vPlacement = (($vPl - $vPlInit)/120); //1px = 60 secondes /2
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
          $evt_id = value.id;
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

    $scope.showDlgAddEpoch = function($numberCol, $date, $timeline_name){
      if($rootScope.electrodeObj.length > 0){
        $scope.electrodeObj = $rootScope.electrodeObj;
      }
      if($rootScope.neuronObj.length > 0){
        $scope.neuronObj = $rootScope.neuronObj;
      }
      if($rootScope.protocolObj.length > 0){
        $scope.protocolObj = $rootScope.protocolObj;
      }
      $scope.epochObj = [];
      $scope.epochObj = angular.element.merge($scope.electrodeObj, $scope.neuronObj, $scope.protocolObj);

      var $date = new Date($date);
      var $restriction = "";
      var $type_epoch = "";
      var $show_modal = 1;
      var $electrodeObjExp = [];
      var $neuronObjExp = [];
      var $exp = "";
      $scope.epochObjList = [];

      angular.element.getScript( "timeline/dict/display_epoch_btn.js");
      angular.forEach(display_epoch_btn, function(value, key) {
        if(display_epoch_btn[key].name == $timeline_name){          
          switch(display_epoch_btn[key].name){
            case "5 Electrode":
              $type_epoch = "electrode";
            break;
            case "6 Neuron":
              $restriction = "A neuron must be linked to an electrode";
              $type_epoch = "neuron";
              $exp = $scope.getExpFromTimeline($numberCol);
              //récupérer l'expériment de la timeline en cours
              $i = 0;
              angular.forEach($scope.electrodeObj, function($value, $key) {
                $strTL = ($scope.electrodeObj[$key].timeline).split("/");
                $expEl = $scope.getExpFromTimeline($strTL[3]);
                if($expEl == $exp){
                  $electrodeObjExp[$i] = $scope.electrodeObj[$key];
                  $i++;
                }
              });
              $j = 0;
              angular.forEach($scope.epochObj, function($value, $key) {
                $strTL = ($scope.epochObj[$key].timeline).split("/");
                $expEl = $scope.getExpFromTimeline($strTL[3]);
                if($expEl == $exp){
                  $scope.epochObjList[$j] = $scope.epochObj[$key];
                  $j++;
                }
              });
              if($electrodeObjExp.length == 0){
                bootbox.alert($restriction);
                $show_modal = 0;
              }

            break;
            case "7 Protocol":
              $restriction = "A protocole must be linked to a neuron";
              $type_epoch = "protocol";
              $exp = $scope.getExpFromTimeline($numberCol);
              $i = 0;
              angular.forEach($scope.neuronObj, function($value, $key) {
                $strTL = ($scope.neuronObj[$key].timeline).split("/");
                $expEl = $scope.getExpFromTimeline($strTL[3]);
                if($expEl == $exp){
                  $neuronObjExp[$i] = $scope.neuronObj[$key];
                  $i++;
                }
              });

              $j = 0;
              angular.forEach($scope.epochObj, function($value, $key) {
                $strTL = ($scope.epochObj[$key].timeline).split("/");
                $expEl = $scope.getExpFromTimeline($strTL[3]);
                if($expEl == $exp){
                  $scope.epochObjList[$j] = $scope.epochObj[$key];
                  $j++;
                }
              });

              if($neuronObjExp.length == 0){
                bootbox.alert($restriction);
                $show_modal = 0;
              }
            break;
            default:
              $type_epoch = "electrode";
          }
        }
      });
      if($show_modal == 1){
        /*$scope.electrodeObj = [];
        $scope.neuronObj = [];
        $scope.protocolObj = [];
        $scope.fromJsonEpoch(1);*/

        ModalService.showModal({
          templateUrl: "timeline/modal_dlg_add_epoch.tpl.html",
          controller: "AddEpochController",
          inputs: {
            title: "Epoch information",
            restriction: $restriction,
            type_epoch: $type_epoch,
            epochObj: $scope.epochObj,
            epochObjList: $scope.epochObjList,
          }
        }).then(function(modal) {
          modal.element.modal();
          modal.close.then(function(result) {
            if(result.type == null){
              bootbox.alert("Please choose type to create epoch !");
            } else if(($type_epoch != "neuron") & (result.link_epoch == "null")) {
              bootbox.alert($restriction);
            } else if(($type_epoch != "protocol") & (result.link_epoch == "null")) {
              bootbox.alert($restriction);
            } else {
              $scope.createEpoch($numberCol, result.text, $date, result.type, result.link_epoch, $type_epoch);
            }
          });
        });
      }
    };
    $scope.getExpFromTimeline = function($numberCol){
      var $experiment = "";
      angular.forEach($scope.timeLineObj, function($value, $key) {
        if($scope.timeLineObj[$key].id == $numberCol){
          $experiment = $scope.timeLineObj[$key].experiment;
        }
      });
      return $experiment;
    };
    $scope.showDlgEditEpoch = function($nbEpoch){
      //récupérer l'epoch correspondant ($nbEpoch = id) dans $scope.epochObj
      angular.forEach($scope.epochObj, function(value, key) {
        if(value.id == $nbEpoch){
          $epoch_id = value.id;
          $epoch_text = value.text;
          $epoch_type = value.type;
          $epoch_start = value.start;
          $epoch_end = value.end;
        }
      });
      ModalService.showModal({
        templateUrl: "timeline/modal_dlg_edit_epoch.tpl.html",
        controller: "EditEpochController",
        inputs: {
          title: "Edit Epoch information",
          epoch_id: $epoch_id,
          epoch_text: $epoch_text,
          epoch_type: $epoch_type,
          epoch_start: $epoch_start,
          epoch_end: $epoch_end,
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if(result.del_epoch == true){
            $scope.showConfirmRemoveEpoch($epoch_id);
          } else {
            if(result.type == null){
              bootbox.alert("Please choose type to save epoch !");
            } else {
              from_end = result.epoch_end.split("/");
              to_end = new Date(from_end[1]+"/"+from_end[0]+"/"+from_end[2]);
              $scope.editEpoch($nbEpoch, result.text, to_end, result.type);
              $scope.toJSON();
            }
          }
        });
      });
    };
    $scope.editEpoch = function($id, $text, $end, $type){
      angular.forEach($scope.epochObj, function(value, key) {
        if(value.id == $id){
          $scope.epochObj[key].text = $text;
          $scope.epochObj[key].end = $end;
          $scope.epochObj[key].endFormat = $end.format('dd/mm/yyyy - HH:MM');
          $scope.epochObj[key].type = $type;
        }
      });
      angular.forEach($scope.electrodeObj, function(value, key) {
        if(value.id == $id){
          $scope.electrodeObj[key].text = $text;
          $scope.electrodeObj[key].end = $end;
          $scope.electrodeObj[key].endFormat = $end.format('dd/mm/yyyy - HH:MM');
          $scope.electrodeObj[key].type = $type;
        }
      });
      angular.forEach($scope.neuronObj, function(value, key) {
        if(value.id == $id){
          $scope.neuronObj[key].text = $text;
          $scope.neuronObj[key].end = $end;
          $scope.neuronObj[key].endFormat = $end.format('dd/mm/yyyy - HH:MM');
          $scope.neuronObj[key].type = $type;
        }
      });
      angular.forEach($scope.protocolObj, function(value, key) {
        if(value.id == $id){
          $scope.neuronObj[key].text = $text;
          $scope.neuronObj[key].end = $end;
          $scope.neuronObj[key].endFormat = $end.format('dd/mm/yyyy - HH:MM');
          $scope.neuronObj[key].type = $type;
        }
      });


    };
    $scope.createEpoch = function($numberCol, $text, $date, $type, $link_epoch, $type_epoch){
        var $startEpoch = new Date();
        var $vPlInit = $date/1e3|0; //date of timeline
        var $vPl = $startEpoch/1e3|0; 
        var $startFormat = $startEpoch.format('mm/dd/yyyy - HH:MM');

        $vPlacement = (($vPl - $vPlInit)/120); //1px = 60 secondes /2
        $scope.addEpoch($numberCol, $text, $startEpoch, $startFormat, $type, $vPlacement, null, null, $link_epoch, $type_epoch);
        $scope.toJSON();
    };
    
    $scope.addEpoch = function($numberCol, $text, $startEpoch, $startFormat, $type, $vPlacement, $endEpoch, $endFormat, $link_epoch, $type_epoch, $resource_uri){
        if(angular.element.isEmptyObject($scope.epochObj)) {
          $idEpoch = 1;
        } else {
          angular.forEach($scope.epochObj, function(value){
            if($scope.epochObj.id > $idEpoch){
              $idEpoch = $scope.epochObj.id;
            }
          });
          $idEpoch++;
        }
        var $i=0;
        var $TLexp = "";
        var $TLcolor = "";
        var $TLName = "";
        angular.forEach($scope.timeLineObj, function($value, $key){
          if($numberCol == $scope.timeLineObj[$key].id){
            $TLexp = $scope.timeLineObj[$key].experiment;
            $TLcolor = $scope.timeLineObj[$key].color;
            $TLName =  $scope.timeLineObj[$key].name;
          }
          if(($vPlacement+150) > $scope.timeLineObj[$key].height){
            $scope.timeLineObj[$key].height = $vPlacement+150;
            angular.element("#graduation").height($vPlacement+150);
          }
          $i++;
        });

        if($endEpoch != null){
          $startEpochTS = $startEpoch.valueOf();
          $endEpochTS = $endEpoch.valueOf();
          $diffTSEpoch = (($endEpochTS/1e3|0) - ($startEpochTS/1e3|0))
        } else {
          $diffTSEpoch = 42;
        }
        $scope.epochObj.push (
            {
                id : $idEpoch,
                timeline : "/notebooks/timeline/" + $numberCol,
                text : $text,
                start : $startEpoch,
                startFormat : $startFormat,
                type : $type,
                color : "#FFE500",
                vPlacement : $vPlacement,
                TimeLineExp : '#/timeline' + $TLexp,
                UrlExp : window.location.hash,
                TimeLineColor : $TLcolor,
                TimeLineName : $TLName,
                end : $endEpoch, 
                endFormat : $endFormat,
                epoch_height : $diffTSEpoch,
                type_epoch : $type_epoch,
                link_epoch : $link_epoch,
                resource_uri : $resource_uri,
            }
        );
        $scope.loopEpochObj();
    };
    $scope.showConfirmRemoveEpoch = function($nbEpoch) {
        ModalService.showModal({
            templateUrl: 'timeline/modal_confirm_remove_epoch.tpl.html',
            controller: "ModalController"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result=="Yes") {
                    $scope.removeEpoch($nbEpoch);
                }
            });
        });
    };

    $scope.removeEpoch = function($nbEpoch){
        angular.element('#epoch_' + $nbEpoch).remove();        
        angular.forEach($scope.epochObj, function($value, $key) {
          if($value.id == $nbEpoch){
            $scope.epochObj.splice($key, 1);
          }
        });
        angular.forEach($scope.electrodeObj, function($value, $key) {
          if($value.id == $nbEpoch){
            $scope.electrodeObj.splice($key, 1);
          }
        });
        angular.forEach($scope.neuronObj, function($value, $key) {
          if($value.id == $nbEpoch){
            $scope.neuronObj.splice($key, 1);
          }
        });
        angular.forEach($scope.protocolObj, function($value, $key) {
          if($value.id == $nbEpoch){
            $scope.protocolObj.splice($key, 1);
          }
        });
        $scope.toJSON();
    };

    $scope.loopEpochObj = function() {
      //vidage des tableaux
      $scope.electrodeObj = [];
      $scope.neuronObj = [];
      $scope.protocolObj = [];

      angular.forEach($scope.epochObj, function(value, key){

        if($scope.epochObj[key].type_epoch == "electrode"){
          $scope.electrodeObj.push ($scope.epochObj[key]);
        }

        if($scope.epochObj[key].type_epoch == "neuron" ){
          $scope.epochObj[key].electrode = $scope.epochObj[key].link_epoch;
          $scope.neuronObj.push ($scope.epochObj[key]);
        }

        if($scope.epochObj[key].type_epoch == "protocol"){
          $scope.epochObj[key].neuron = $scope.epochObj[key].link_epoch;
          $scope.protocolObj.push ($scope.epochObj[key]);
        }
      });
    };

    $scope.toJSON = function() { //convert object to JSON and save it in database
      var id_exp = $routeParams.eID;
      var $prevJSONContentEvent = '';

      $scope.jsonContentTimeLine = '{ "objects" : ' + angular.toJson($scope.timeLineObj) + '}';
      $scope.jsonContentEvent = '{ "objects" : ' + angular.toJson($scope.eventObj) + '}';        
      $scope.jsonContentElectrode = '{ "objects" : ' + angular.toJson($scope.electrodeObj) + '}';
      $scope.jsonContentNeuron = '{ "objects" : ' + angular.toJson($scope.neuronObj) + '}';
      $scope.jsonContentProtocol = '{ "objects" : ' + angular.toJson($scope.protocolObj) + '}';        


      //clear tabs of epoch
      timeLine.put({experiment__id:id_exp}, $scope.jsonContentTimeLine , function(){}).$promise.then(function(val) {
        events.put( $scope.jsonContentEvent, function(){} );
        electrode.put( $scope.jsonContentElectrode, function(){} ).$promise.then(function(val) {
          $rootScope.electrodeObj = val.objects;
          neuron.put( $scope.jsonContentNeuron, function(){} ).$promise.then(function(val2) {
            $rootScope.neuronObj = val2.objects;
            protocol.put( $scope.jsonContentProtocol, function(val3){
              $rootScope.protocolObj = val3.objects;
            });
          });
        });
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
          $scope.fromJsonEpoch(1);
        });
    };

    $scope.displayZoomEvent = function ($scale) {
      angular.element('.event').remove();
      $scope.eventObj = [];
      $scope.epochObj = [];
      $scope.fromJsonEvent($scale);
      $scope.fromJsonEpoch($scale);
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
            $diffTSEvt = (($timeStampEvtMax/1e3|0) - ($timeStampEvtMin/1e3|0))/$scl_coef; ///60
          } else {
            $diffTSEvt = 0;
          }
          if( value != null ){
              $nCol = value.timeline.split('/');
              $numberCol = $nCol[3];
              $dateEvt = new Date(value.date);
              $dateFormat = $dateEvt.format('mm/dd/yyyy - HH:MM');
              $scope.addEvent($numberCol, value.text, $dateEvt, $dateFormat, value.type, $diffTSEvt);
          }
          $i++;
        });
      });
    };

    $scope.fromJsonEpoch = function($scale){
      $scope.response = electrode.get({}, function(data){
        $scope.functionFromJsonEpoch(data, $scale, "electrode");
      });
      $scope.response = neuron.get({}, function(data){
        $scope.functionFromJsonEpoch(data, $scale, "neuron");
      });
      $scope.response = protocol.get({}, function(data){
        $scope.functionFromJsonEpoch(data, $scale, "protocol");
      });
    };

    $scope.functionFromJsonEpoch = function(data, $scale, $type_epoch){
        $jsonEpoch = angular.fromJson(data.objects);
        $timeStampEvtMax = 0;
        $timeStampEvtMin = 0;
        $diffTSEpoch = 0;
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
        angular.forEach($jsonEpoch, function(value, key) {
          if($scope.TLExp.indexOf(value.timeline) != -1){
            $startEpoch = new Date(value.start);
            if(($timeStampEvtMin > $startEpoch.valueOf()) || ( $timeStampEvtMin == 0)){
              $timeStampEvtMin = $startEpoch.valueOf();
            }
            if($timeStampEvtMax < $startEpoch.valueOf()){
              $timeStampEvtMax = $startEpoch.valueOf();
            }
            $diffTSEpoch = (($timeStampEvtMax/1e3|0) - ($timeStampEvtMin/1e3|0))/$scl_coef; ///60
          } else {
            $diffTSEpoch = 0;
          }
          if( value != null ){
              $nCol = value.timeline.split('/');
              $numberCol = $nCol[3];
              $startEpoch = new Date(value.start);
              $startFormat = $startEpoch.format('mm/dd/yyyy - HH:MM');
              if(value.end != null){
                $endEpoch = new Date(value.end);
                $endFormat = $endEpoch.format('mm/dd/yyyy - HH:MM');
                $scope.addEpoch($numberCol, value.text, $startEpoch, $startFormat, value.type, $diffTSEpoch, $endEpoch, $endFormat, null, $type_epoch, value.resource_uri);
              } else {
                $scope.addEpoch($numberCol, value.text, $startEpoch, $startFormat, value.type, $diffTSEpoch, null, null, null, $type_epoch, value.resource_uri);
              }
          }
          $i++;
        });
    };

    $scope.eventZIndex = function($event_id) {
        angular.element(".event").css("z-index", "0");
        angular.element(".epoch").css("z-index", "0");
        angular.element(".event_" + $event_id).css("z-index", "10");
    };

    $scope.epochZIndex = function($epoch_id) {
        angular.element(".event").css("z-index", "0");
        angular.element(".epoch").css("z-index", "0");
        angular.element(".epoch_" + $epoch_id).css("z-index", "10");
    };

    $scope.toogleEvtLeft = function() {
      angular.element(".textEventLeft").slideToggle(500);
    };

    $scope.stopExperiment = function() {
      $scope.experiment = Experiment.get(function(data){
        //data.object
        angular.forEach(data.objects, function($value){
          if($value.id == $routeParams.eID){
            var $dateEnd = new Date();
            $value.end = $dateEnd;
          }
        });
        $scope.jsonContentExp = angular.toJson(data);
        Experiment.put({id:$routeParams.eID}, $scope.jsonContentExp, function(){}).$promise.then(function(val) {
          $scope.toJSON();
        });
      });
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

mod_tlv.directive('electrodeDir', function(){
  return {
    templateUrl: 'timeline/electrode.tpl.html'
  };
});

mod_tlv.directive('neuronDir', function(){
  return {
    templateUrl: 'timeline/neuron.tpl.html'
  };
});

mod_tlv.directive('protocolDir', function(){
  return {
    templateUrl: 'timeline/protocol.tpl.html'
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

mod_tlv.controller('AddEpochController', [
  '$scope', '$element', 'title', 'restriction', 'epochObj', 'epochObjList', 'type_epoch', 'close', 
  function($scope, $element, title, restriction, epochObj, epochObjList , type_epoch, close) {

  $scope.text = null;
  //$scope.date = null;
  $scope.type = null;
  $scope.type_epoch = type_epoch;
  $scope.link_epoch = null;
  $scope.title = title;
  $scope.restriction = restriction;
  $scope.epochObj = epochObj;
  $scope.epochObjList = epochObjList;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
    $link_epoch = angular.element('#link_epoch').val();
    close({
      text: $scope.text,
      //date: $scope.date,
      type: $scope.type,
      link_epoch: $link_epoch, //$scope.link_epoch
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function() {
    //  Manually hide the modal.
    $element.modal('hide');
    //  Now call close, returning control to the caller.
    $link_epoch = angular.element('#link_epoch').val();
    close({
      text: $scope.text,
      //date: $scope.date,
      type: $scope.type,
      link_epoch:  $link_epoch,
    }, 100); // close, but give 500ms for bootstrap to animate
  };
}]);

mod_tlv.controller('EditEpochController', [
  '$scope', '$element', 'title', 'epoch_text', 'epoch_type', 'epoch_start', 'epoch_end', 'epoch_id', 'close', 
  function($scope, $element, title, epoch_text, epoch_type, epoch_start, epoch_end, epoch_id, close) {
  if(epoch_end == null){
    epoch_end = new Date();
  }
  $scope.text = epoch_text;
  $scope.epoch_id = epoch_id;
  $scope.epoch_start = epoch_start.format('dd/mm/yyyy HH:MM');
  $scope.epoch_end = epoch_end.format('dd/mm/yyyy HH:MM');
  $scope.type = epoch_type;
  $scope.title = title;
  $scope.del_epoch = false;

  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
    close({
      text: $scope.text,
      epoch_end: angular.element('#epoch_end_'+$scope.epoch_id).val(),
      type: $scope.type,
      del_epoch: $scope.del_epoch,
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
      epoch_end: angular.element('#epoch_end_'+$scope.epoch_id).val(),
      type: $scope.type,
      type_epoch: $scope.type_epoch,
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  $scope.delete = function(){
    $scope.del_epoch = true;
    $scope.close();
  };

  $scope.disableTimeStamp = function($epoch_id) {
    angular.element("#epoch_end_"+$epoch_id).prop('disabled', true);
  };

  $scope.enableTimeStamp = function($epoch_id) {
    angular.element("#epoch_end_"+$epoch_id).prop('disabled', false);
  };

  $scope.displayDatePicker = function($epoch_id) {
    angular.element('#datetimepicker_'+$epoch_id).datetimepicker({
        locale: 'en-gb'
    });
  };
}]);
