
var mod_tlv = angular.module('mod_tlv', ['ui.bootstrap', 
                                         'angularModalService', 
                                         'timeLineServices', 
                                         'eventServices',
                                         'electrodeServices',
                                         'neuronServices',
                                         'CellService',
                                         'protocolServices',
                                         'hermann.experiments',
                                         'CellTypeService',
                                         'DeviceTypeService'
                                         ]);
mod_tlv.controller('timeLineVisualController', 
function ($scope, $rootScope, $compile, ModalService, $http, $q, timeLine, events, electrode, neuron, Cell, CellType, protocol, $routeParams, Experiment) {
    $scope.nbEvent = [];
    $scope.timeLineObj = [];
    $scope.eventObj = [];
    $scope.epochObj = [];
    $scope.electrodeObj = [];
    $scope.neuronObj = [];
    $scope.cellObj = [];
    $scope.protocolObj = [];
    $rootScope.electrodeObj = [];
    $rootScope.neuronObj = [];
    $rootScope.protocolObj = [];

    $scope.$routeParams = $routeParams;

    $scope.idExp = 0;
    $scope.dateStartExp = "";
    $scope.dateEndExp = "";
    $scope.heightMinEpoch = 35;
    $rootScope.spin = 0;

    $scope.experiment = Experiment.get(function(data){
      //data.object
      angular.forEach(data.objects, function($value){
        if($value.id.toString() == $routeParams.eID){
          $scope.idExp = $value.id;
          $dateStartExp = new Date($value.start);
          $scope.dateStartExp0 = $dateStartExp;
          $scope.dateStartExp = $dateStartExp.format('dd/mm/yyyy - HH:MM');

          $dateEndExp = new Date($value.end);
          if($value.end!=null){
            $scope.dateEndExp = $dateEndExp.format('dd/mm/yyyy - HH:MM');
          }
        }
      });
    });

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
          $scope.createEvent($numberCol, result.text, result.type);
        });
      });
    };

    $scope.createEvent = function($numberCol, $text, $type){
        var $dateEvent = new Date();
        var $vPlInit = $scope.dateStartExp0/1e3|0; 
        var $vPl = $dateEvent/1e3|0; 
        var $dateFormat = $dateEvent.format('dd/mm/yyyy - HH:MM');

        $vPlacement = (($vPl - $vPlInit)/60); //1px = 60 secondes
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
        var $vPlInit = $scope.dateStartExp0/1e3|0; 
        var $vPl = $date/1e3|0; 
        $vPlacement = (($vPl - $vPlInit)/60); //1px = 60 secondes
      angular.forEach($scope.eventObj, function(value, key) {
        if(value.id == $id){
          $scope.eventObj[key].text = $text;
          $scope.eventObj[key].date = $date;
          $scope.eventObj[key].dateFormat = $date.format('dd/mm/yyyy - HH:MM');
          $scope.eventObj[key].type = $type;
          $scope.eventObj[key].vPlacement = $vPlacement;
        }
      });
    };


    $scope.showDlgAddElectrode = function($numberCol, $date, $timeline_name){
      ModalService.showModal({
        templateUrl: "timeline/modal_dlg_add_electrode.tpl.html",
        controller: "AddElectrodeController",
        inputs: {
          title: "Electrode information",
          electrodeObj: $scope.electrodeObj,
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          $scope.createElectrode($numberCol, result.text, result.type);
        });
      });
    };

    $scope.showDlgAddNeuron = function($numberCol, $date, $timeline_name){
      var defered = $q.defer();
      $scope.tabEl = [];
      $exp = $scope.getExpFromTimeline($numberCol);
      electrode.get(function(){}).$promise.then(function($data){
        $i = 0;
        $j = 0;
        angular.forEach($data.objects, function($value){
          $strTL = ($data.objects[$j].timeline).split("/");
          $expEl = $scope.getExpFromTimeline($strTL[3]);
          if($exp == $expEl){
            $scope.tabEl[$i] = $value;
            $startF = new Date($value.start);
            $scope.tabEl[$i].startFormat = $startF.format('dd/mm/yyyy - HH:MM');
            $i++;
          }
          $j++;
        });
        defered.resolve($scope.tabEl);
      });
      var promise = defered.promise;
        promise.then(function(result) {
        ModalService.showModal({
          templateUrl: "timeline/modal_dlg_add_neuron.tpl.html",
          controller: "AddNeuronController",
          inputs: {
            title: "Neuron information",
            neuronObj: $scope.neuronObj,
            electrodeObjList: result,
          }
        }).then(function(modal) {
          modal.element.modal();
          modal.close.then(function(result) {
            $scope.createNeuron($numberCol, result.text, result.type, result.link_electrode);
          });
        });
      });
    };

    $scope.showDlgAddProtocol = function($numberCol, $date, $timeline_name){
      var defered = $q.defer();
      $scope.tabNeur = [];
      $exp = $scope.getExpFromTimeline($numberCol);
      neuron.get(function(){}).$promise.then(function($data){
        $i = 0;
        $j = 0;
        angular.forEach($data.objects, function($value){
          $strTL = ($data.objects[$j].timeline).split("/");
          $expNeur = $scope.getExpFromTimeline($strTL[3]);
          if($exp == $expNeur){
            $scope.tabNeur[$i] = $value;
            $startF = new Date($value.start);
            $scope.tabNeur[$i].startFormat = $startF.format('dd/mm/yyyy - HH:MM');;
            $i++;
          }
          $j++;
        });
        defered.resolve($scope.tabNeur);
      });
      var promise = defered.promise;
      promise.then(function(result) {
        ModalService.showModal({
          templateUrl: "timeline/modal_dlg_add_protocol.tpl.html",
          controller: "AddProtocolController",
          inputs: {
            title: "Protocol information",
            protocolObj: $scope.protocolObj,
            neuronObjList: result,
          }
        }).then(function(modal) {
          modal.element.modal();
          modal.close.then(function(result) {
            $scope.createProtocol($numberCol, result.text, result.type, result.link_neuron);
          });
        });
      });
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

    $scope.showDlgEditElectrode = function($nbElectrode, $timeline_name){
      var $exp = "";
      var $electrodeObjExp = [];

      //récupérer l'epoch correspondant ($nbEpoch = id) dans $scope.epochObj
      angular.forEach($scope.electrodeObj, function(value, key) {
        if(value.id == $nbElectrode){
          $electrode_id = value.id;
          $electrode_text = value.text;
          $electrode_type = value.type;
          $electrode_start = value.start;
          $electrode_end = value.end;
          $electrode = value.electrode;
        }
      });
//  '$scope', '$element', 'title', 'epoch_text', 'epoch_type', 'epoch_start', 'epoch_end', 'epoch_id', 'epochObj', 'epochObjList', 'type_epoch', 'link_epoch', 'close', 
//  function($scope, $element, title, epoch_text, epoch_type, epoch_start, epoch_end, epoch_id, epochObj, epochObjList, type_epoch, link_epoch, close) {

      ModalService.showModal({
        templateUrl: "timeline/modal_dlg_edit_epoch.tpl.html",
        controller: "EditEpochController",
        inputs: {
          title: "Edit Electrode information",
          epoch_id: $electrode_id,
          epoch_text: $electrode_text,
          epoch_type: $electrode_type,
          epoch_start: $electrode_start,
          epoch_end: $electrode_end,
          type_epoch: "electrode",
          link_epoch: $electrode,
          epochObj: $scope.electrodeObj,
          epochObjList: $scope.electrodeObjList,
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {

          from_start = result.epoch_start.split("/");
          to_start = new Date(from_start[1]+"/"+from_start[0]+"/"+from_start[2]);;

          if(result.del_epoch == true){
            $scope.showConfirmRemoveEpoch($electrode_id, "electrode");
          } else if (result.stop_epoch == true){
            $date_end = new Date();
            $scope.editElectrode($nbElectrode, result.text, to_start, $date_end, result.type);
            $scope.toJSON();
          } else {
            if(result.type == null){
              bootbox.alert("Please choose type to save electrode !");
            } else {
              if(result.epoch_end != ""){
                from_end = result.epoch_end.split("/");
                to_end = new Date(from_end[1]+"/"+from_end[0]+"/"+from_end[2]);
              } else {
                to_end = "";
              }
              $scope.editElectrode($nbElectrode, result.text, to_start, to_end, result.type);
              $scope.toJSON();
            }
          }
        });
      });
    };

    $scope.showDlgEditNeuron = function($nbNeuron, $timeline_name){
      var $exp = "";
      var $electrodeObjExp = [];

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

      if($electrodeObjExp.length == 0){
        bootbox.alert($restriction);
        $show_modal = 0;
      }

      //récupérer l'epoch correspondant ($nbEpoch = id) dans $scope.epochObj
      angular.forEach($scope.neuronObj, function(value, key) {
        if(value.id == $nbNeuron){
          $neuron_id = value.id;
          $neuron_text = value.text;
          $neuron_type = value.type;
          $neuron_start = value.start;
          $neuron_end = value.end;
          $neuron = value.neuron;
        }
      });
//  '$scope', '$element', 'title', 'epoch_text', 'epoch_type', 'epoch_start', 'epoch_end', 'epoch_id', 'epochObj', 'epochObjList', 'type_epoch', 'link_epoch', 'close', 
//  function($scope, $element, title, epoch_text, epoch_type, epoch_start, epoch_end, epoch_id, epochObj, epochObjList, type_epoch, link_epoch, close) {

      ModalService.showModal({
        templateUrl: "timeline/modal_dlg_edit_epoch.tpl.html",
        controller: "EditEpochController",
        inputs: {
          title: "Edit Neuron information",
          epoch_id: $neuron_id,
          epoch_text: $neuron_text,
          epoch_type: $neuron_type,
          epoch_start: $neuron_start,
          epoch_end: $neuron_end,
          type_epoch: "neuron",
          link_epoch: $neuron,
          epochObj: $scope.neuronObj,
          epochObjList: $scope.neuronObjList,
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {

          from_start = result.epoch_start.split("/");
          to_start = new Date(from_start[1]+"/"+from_start[0]+"/"+from_start[2]);;

          if(result.del_epoch == true){
            $scope.showConfirmRemoveEpoch($neuron_id, "neuron");
          } else if (result.stop_epoch == true){
            $date_end = new Date();
            $scope.editNeuron($nbNeuron, result.text, to_start, $date_end, result.type);
            $scope.toJSON();
          } else {
            if(result.type == null){
              bootbox.alert("Please choose type to save neuron !");
            } else {
              if(result.epoch_end != ""){
                from_end = result.epoch_end.split("/");
                to_end = new Date(from_end[1]+"/"+from_end[0]+"/"+from_end[2]);
              } else {
                to_end = "";
              }
              $scope.editNeuron($nbNeuron, result.text, to_start, to_end, result.type);
              $scope.toJSON();
            }
          }
        });
      });
    };

    $scope.showDlgEditProtocol = function($nbProtocol, $timeline_name){
      var $exp = "";
      var $protocolObjExp = [];

      $restriction = "A protocole must be linked to a protocol";
      $type_epoch = "protocol";
      $exp = $scope.getExpFromTimeline($numberCol);
      $i = 0;
      angular.forEach($scope.protocolObj, function($value, $key) {
        $strTL = ($scope.protocolObj[$key].timeline).split("/");
        $expEl = $scope.getExpFromTimeline($strTL[3]);
        if($expEl == $exp){
          $protocolObjExp[$i] = $scope.protocolObj[$key];
          $i++;
        }
      });

      if($protocolObjExp.length == 0){
        bootbox.alert($restriction);
        $show_modal = 0;
      }

      //récupérer l'epoch correspondant ($nbEpoch = id) dans $scope.epochObj
      angular.forEach($scope.protocolObj, function(value, key) {
        if(value.id == $nbProtocol){
          $protocol_id = value.id;
          $protocol_text = value.text;
          $protocol_type = value.type;
          $protocol_start = value.start;
          $protocol_end = value.end;
          $protocol = value.protocol;
        }
      });


//  '$scope', '$element', 'title', 'epoch_text', 'epoch_type', 'epoch_start', 'epoch_end', 'epoch_id', 'epochObj', 'epochObjList', 'type_epoch', 'link_epoch', 'close', 
//  function($scope, $element, title, epoch_text, epoch_type, epoch_start, epoch_end, epoch_id, epochObj, epochObjList, type_epoch, link_epoch, close) {

      ModalService.showModal({
        templateUrl: "timeline/modal_dlg_edit_epoch.tpl.html",
        controller: "EditEpochController",
        inputs: {
          title: "Edit Protocol information",
          epoch_id: $protocol_id,
          epoch_text: $protocol_text,
          epoch_type: $protocol_type,
          epoch_start: $protocol_start,
          epoch_end: $protocol_end,
          type_epoch: "protocol",
          link_epoch: $protocol,
          epochObj: $scope.protocolObj,
          epochObjList: $scope.protocolObjList,
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {

          from_start = result.epoch_start.split("/");
          to_start = new Date(from_start[1]+"/"+from_start[0]+"/"+from_start[2]);;

          if(result.del_epoch == true){
            $scope.showConfirmRemoveEpoch($protocol_id, "protocol");
          } else if (result.stop_epoch == true){
            $date_end = new Date();
            $scope.editProtocol($nbProtocol, result.text, to_start, $date_end, result.type);
            $scope.toJSON();
          } else {
            if(result.type == null){
              bootbox.alert("Please choose type to save protocol !");
            } else {
              if(result.epoch_end != ""){
                from_end = result.epoch_end.split("/");
                to_end = new Date(from_end[1]+"/"+from_end[0]+"/"+from_end[2]);
              } else {
                to_end = "";
              }
              $scope.editProtocol($nbProtocol, result.text, to_start, to_end, result.type);
              $scope.toJSON();
            }
          }
        });
      });
    };

    $scope.editElectrode = function($id, $text, $start, $end, $type){
      var $vPlInit = $scope.dateStartExp0/1e3|0; 
      var $vPl = $start/1e3|0; 
      $vPlacement = (($vPl - $vPlInit)/60); //1px = 60 secondes*/

      $startElectrodeTS = $start.valueOf();
      $endElectrodeTS = $end.valueOf();
      $diffTSElectrode = (($endElectrodeTS/1e3|0) - ($startElectrodeTS/1e3|0)) / $scl_coef;
      if($diffTSElectrode < ($scope.heightMinEpoch+1)){
        $diffTSElectrode = $scope.heightMinEpoch;
      }
      angular.forEach($scope.electrodeObj, function(value, key) {
        if((value.id == $id)){
          $scope.electrodeObj[key].text = $text;
          $scope.electrodeObj[key].start = $start;
          $scope.electrodeObj[key].startFormat = $start.format('dd/mm/yyyy - HH:MM');
          if($end != ""){
            $scope.electrodeObj[key].end = $end;
            $scope.electrodeObj[key].endFormat = $end.format('dd/mm/yyyy - HH:MM');
          }
          $scope.electrodeObj[key].type = $type;
          $scope.electrodeObj[key].epoch_height = $diffTSElectrode;
          $scope.electrodeObj[key].vPlacement = $vPlacement;
        }
      });
    };

    $scope.editNeuron = function($id, $text, $start, $end, $type){
      var $vPlInit = $scope.dateStartExp0/1e3|0; 
      var $vPl = $start/1e3|0; 
      $vPlacement = (($vPl - $vPlInit)/60); //1px = 60 secondes*/

      $startNeuronTS = $start.valueOf();
      $endNeuronTS = $end.valueOf();
      $diffTSNeuron = (($endNeuronTS/1e3|0) - ($startNeuronTS/1e3|0)) / $scl_coef;
      if($diffTSNeuron < ($scope.heightMinEpoch+1)){
        $diffTSNeuron = $scope.heightMinEpoch;
      }
      angular.forEach($scope.neuronObj, function(value, key) {
        if(value.id == $id){
          $scope.neuronObj[key].text = $text;
          $scope.neuronObj[key].start = $start;
          $scope.neuronObj[key].startFormat = $start.format('dd/mm/yyyy - HH:MM');
          if($end != ""){
            $scope.neuronObj[key].end = $end;
            $scope.neuronObj[key].endFormat = $end.format('dd/mm/yyyy - HH:MM');
          }
          $scope.neuronObj[key].type = $type;
          $scope.neuronObj[key].epoch_height = $diffTSNeuron;
          $scope.neuronObj[key].vPlacement = $vPlacement;
        }
      });
    };

    $scope.editProtocol = function($id, $text, $start, $end, $type){
      var $vPlInit = $scope.dateStartExp0/1e3|0; 
      var $vPl = $start/1e3|0; 
      $vPlacement = (($vPl - $vPlInit)/60); //1px = 60 secondes*/

      $startProtocolTS = $start.valueOf();
      $endProtocolTS = $end.valueOf();
      $diffTSProtocol = (($endProtocolTS/1e3|0) - ($startProtocolTS/1e3|0)) / $scl_coef;
      if($diffTSProtocol < ($scope.heightMinEpoch+1)){
        $diffTSProtocol = $scope.heightMinEpoch;
      }
      angular.forEach($scope.protocolObj, function(value, key) {
        if(value.id == $id){
          $scope.protocolObj[key].text = $text;
          $scope.protocolObj[key].start = $start;
          $scope.protocolObj[key].startFormat = $start.format('dd/mm/yyyy - HH:MM');
          if($end != ""){
            $scope.protocolObj[key].end = $end;
            $scope.protocolObj[key].endFormat = $end.format('dd/mm/yyyy - HH:MM');
          }
          $scope.protocolObj[key].type = $type;
          $scope.protocolObj[key].epoch_height = $diffTSProtocol;
          $scope.protocolObj[key].vPlacement = $vPlacement;
        }
      });
    };

    $scope.createElectrode = function($numberCol, $text, $type){
        angular.element(window).spin();
        $rootScope.spin = 1;
      
        var $startElectrode = new Date();
        var $vPlInit = $scope.dateStartExp0/1e3|0;
        var $vPl = $startElectrode/1e3|0; 
        var $startFormat = $startElectrode.format('dd/mm/yyyy - HH:MM');

        //search existing electrode on the same timeline
        $scope.defered = $q.defer();
        $scope.nbElectrode = 0;

        var promise = $scope.defered.promise;
        $scope.getExistingElectrodeOnTimeLine($numberCol);
        promise.then(function(result) {
          $scope.nbElectrode = result;
        });

        $vPlacement = (($vPl - $vPlInit)/60); //1px = 60 secondes
        $scope.addElectrode($numberCol, $text, $startElectrode, $startFormat, $type, $vPlacement, 60, null, null);
        $scope.toJSON();
    };

    $scope.createNeuron = function($numberCol, $text, $type, $electrode){
      angular.element(window).spin();
      $rootScope.spin = 1;

      var $startNeuron = new Date();
      var $vPlInit = $scope.dateStartExp0/1e3|0;
      var $vPl = $startNeuron/1e3|0; 
      var $startFormat = $startNeuron.format('dd/mm/yyyy - HH:MM');

      //search existing epoch on the same timeline
      $scope.defered = $q.defer();
      $scope.nbEpoch = 0;

      var promise = $scope.defered.promise;
      $scope.getExistingNeuronOnTimeLine($numberCol);
      promise.then(function(result) {
        $scope.nbEpoch = result;
      });

      $vPlacement = (($vPl - $vPlInit)/60); //1px = 60 secondes
      $scope.addNeuron($numberCol, $text, $startNeuron, $startFormat, $type, $vPlacement, 60, null, null, $electrode);
    };

    $scope.createProtocol = function($numberCol, $text, $type, $neuron){
      angular.element(window).spin();
      $rootScope.spin = 1;

      var $startProtocol = new Date();
      var $vPlInit = $scope.dateStartExp0/1e3|0;
      var $vPl = $startProtocol/1e3|0; 
      var $startFormat = $startProtocol.format('dd/mm/yyyy - HH:MM');

      //search existing epoch on the same timeline
      $scope.defered = $q.defer();
      $scope.nbProtocol = 0;

      var promise = $scope.defered.promise;
      $scope.getExistingProtocolOnTimeLine($numberCol);
      promise.then(function(result) {
        $scope.nbProtocol = result;
      });

      $vPlacement = (($vPl - $vPlInit)/60); //1px = 60 secondes
      $scope.addProtocol($numberCol, $text, $startProtocol, $startFormat, $type, $vPlacement, 60, null, null, $neuron);
      $scope.toJSON();
    };

    $scope.getExistingElectrodeOnTimeLine = function($numberCol){
      $date_end = new Date();
      electrode.get(function(){}).$promise.then(function($data){
        angular.forEach($data.objects, function($value){
          $resource_uri_splitted = $value.resource_uri.split('/');
          $date_start = new Date($value.start);
          $id = $resource_uri_splitted[3];
          if(($value.timeline == "/notebooks/timeline/" + $numberCol) & ($value.end == null)){
            $scope.editElectrode($id, $value.text, $date_start, $date_end, $value.type);
            $scope.toJSON();
            $scope.nbElectrode++;
          }
        });
        $scope.defered.resolve($scope.nbElectrode);
      });
    };

    $scope.getExistingNeuronOnTimeLine = function($numberCol){
      $date_end = new Date();
      neuron.get(function(){}).$promise.then(function($data){
        angular.forEach($data.objects, function($value){
          $resource_uri_splitted = $value.resource_uri.split('/');
          $date_start = new Date($value.start);
          $id = $resource_uri_splitted[3];
          if(($value.timeline == "/notebooks/timeline/" + $numberCol) & ($value.end == null)){
            $scope.editNeuron($id, $value.text, $date_start, $date_end, $value.type);
            $scope.toJSON();
            $scope.nbNeuron++;
          }
        });
        $scope.defered.resolve($scope.nbNeuron);
      });
    };

    $scope.getExistingProtocolOnTimeLine = function($numberCol){
      $date_end = new Date();
      protocol.get(function(){}).$promise.then(function($data){
        angular.forEach($data.objects, function($value){
          $resource_uri_splitted = $value.resource_uri.split('/');
          $date_start = new Date($value.start);
          $id = $resource_uri_splitted[3];
          if(($value.timeline == "/notebooks/timeline/" + $numberCol) & ($value.end == null)){
            $scope.editProtocol($id, $value.text, $date_start, $date_end, $value.type);
            $scope.toJSON();
            $scope.nbProtocol++;
          }
        });
        $scope.defered.resolve($scope.nbProtocol);
      });
    };

    $scope.addElectrode = function($numberCol, $text, $startElectrode, $startFormat, $type, $vPlacement, $scl_coef, $endElectrode, $endFormat){
      if(angular.element.isEmptyObject($scope.electrodeObj)) {
        $idElectrode = 1;
      } else {
        angular.forEach($scope.electrodeObj, function(value){
          if($scope.electrodeObj.id > $idElectrode){
            $idElectrode = $scope.electrodeObj.id;
          }
        });
        $idElectrode++;
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

      if($endElectrode != null){
        $startElectrodeTS = $startElectrode.valueOf();
        $endElectrodeTS = $endElectrode.valueOf();
        $diffTSElectrode = (($endElectrodeTS/1e3|0) - ($startElectrodeTS/1e3|0)) / $scl_coef;
        if($diffTSElectrode < ($scope.heightMinEpoch+1)){
          $diffTSElectrode = $scope.heightMinEpoch;
        }
      } else {
        $diffTSElectrode = $scope.heightMinEpoch;
      }

      $scope.electrodeObj.push (
        {
            id : $idElectrode,
            timeline : "/notebooks/timeline/" + $numberCol,
            text : $text,
            start : $startElectrode,
            startFormat : $startFormat,
            type : $type,
            color : "#FFE500",
            vPlacement : $vPlacement,
            TimeLineExp : '#/timeline' + $TLexp,
            UrlExp : window.location.hash,
            TimeLineColor : $TLcolor,
            TimeLineName : $TLName,
            end : $endElectrode, 
            endFormat : $endFormat,
            epoch_height : $diffTSElectrode,
        }
      );
    };

    $scope.addNeuron = function($numberCol, $text, $startNeuron, $startFormat, $type, $vPlacement, $scl_coef, $endNeuron, $endFormat, $electrode){
      if(angular.element.isEmptyObject($scope.neuronObj)) {
        $idNeuron = 1;
      } else {
        angular.forEach($scope.neuronObj, function(value){
          if($scope.neuronObj.id > $idNeuron){
            $idNeuron = $scope.neuronObj.id;
          }
        });
        $idNeuron++;
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

      if($endNeuron != null){
        $startNeuronTS = $startNeuron.valueOf();
        $endNeuronTS = $endNeuron.valueOf();
        $diffTSNeuron = (($endNeuronTS/1e3|0) - ($startNeuronTS/1e3|0)) / $scl_coef;
        if($diffTSNeuron < ($scope.heightMinEpoch+1)){
          $diffTSNeuron = $scope.heightMinEpoch;
        }
      } else {
        $diffTSNeuron = $scope.heightMinEpoch;
      }

      var $idcell = '';
      CellType.get(function($data){
        angular.forEach($data.objects, function($value){
          if($value.name == $type){
            $scope.cellObj.push (
              {
                label : $text,
                type : $value.resource_uri,
                //properties : 
              });
            $idcell = $value.resource_uri;
          }
        });
        $scope.neuronObj.push (
            {
                id : $idNeuron,
                timeline : "/notebooks/timeline/" + $numberCol,
                text : $text,
                start : $startNeuron,
                startFormat : $startFormat,
                type : $type,
                color : "#FFE500",
                vPlacement : $vPlacement,
                TimeLineExp : '#/timeline' + $TLexp,
                UrlExp : window.location.hash,
                TimeLineColor : $TLcolor,
                TimeLineName : $TLName,
                end : $endNeuron, 
                endFormat : $endFormat,
                epoch_height : $diffTSNeuron,
                electrode : $electrode,
                idcell: $idcell,
            }
        );
        $scope.toJSON();
      });
    };

    $scope.addProtocol = function($numberCol, $text, $startProtocol, $startFormat, $type, $vPlacement, $scl_coef, $endProtocol, $endFormat, $neuron){
      if(angular.element.isEmptyObject($scope.protocolObj)) {
        $idProtocol = 1;
      } else {
        angular.forEach($scope.protocolObj, function(value){
          if($scope.protocolObj.id > $idProtocol){
            $idProtocol = $scope.protocolObj.id;
          }
        });
        $idProtocol++;
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

      if($endProtocol != null){
        $startProtocolTS = $startProtocol.valueOf();
        $endProtocolTS = $endProtocol.valueOf();
        $diffTSProtocol = (($endProtocolTS/1e3|0) - ($startProtocolTS/1e3|0)) / $scl_coef;
        if($diffTSProtocol < ($scope.heightMinEpoch+1)){
          $diffTSProtocol = $scope.heightMinEpoch;
        }
      } else {
        $diffTSProtocol = $scope.heightMinEpoch;
      }

      $scope.protocolObj.push (
          {
              id : $idProtocol,
              timeline : "/notebooks/timeline/" + $numberCol,
              text : $text,
              start : $startProtocol,
              startFormat : $startFormat,
              type : $type,
              color : "#FFE500",
              vPlacement : $vPlacement,
              TimeLineExp : '#/timeline' + $TLexp,
              UrlExp : window.location.hash,
              TimeLineColor : $TLcolor,
              TimeLineName : $TLName,
              end : $endProtocol, 
              endFormat : $endFormat,
              epoch_height : $diffTSProtocol,
              neuron : $neuron,
          }
      );
    };

    $scope.showConfirmRemoveEpoch = function($nbEpoch, $type_epoch) {
        ModalService.showModal({
            templateUrl: 'timeline/modal_confirm_remove_epoch.tpl.html',
            controller: "ModalController"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result=="Yes") {
                  if($type_epoch == "electrode"){
                    $scope.removeElectrode($nbEpoch);
                  } else if($type_epoch == "neuron"){
                    $scope.removeNeuron($nbEpoch);
                  } else if($type_epoch == "protocol"){
                    $scope.removeProtocol($nbEpoch);
                  }
                }
            });
        });
    };

    $scope.removeElectrode = function($nbElectrode){
      $scope.tabNeur = [];
      neuron.get(function($data){
        $i=0;
        angular.forEach($data.objects, function($value){
          if($value.electrode == "/notebooks/electrode/"+$nbElectrode){
            $scope.tabNeur[$i] = $value;
            $i++;
          }
        });
        if($scope.tabNeur.length == 0){
          angular.forEach($scope.electrodeObj, function($value, $key) {
            if($value.id == $nbElectrode){
              $scope.electrodeObj.splice($key, 1);
            }
          });
          $scope.toJSON();
        } else {
          bootbox.alert("You must remove dependant neurons of this electrode before remove it.");
        }
      });
    };

    $scope.removeNeuron = function($nbNeuron){
      $scope.tabProtocol = [];
      protocol.get(function($data){
        $i=0;
        angular.forEach($data.objects, function($value){
          if($value.neuron == "/notebooks/neuron/"+$nbNeuron){
            $scope.tabProtocol[$i] = $value;
            $i++;
          }
        });
        $i=0;
        if($scope.tabProtocol.length == 0){
          angular.forEach($scope.neuronObj, function($value, $key) {
            if($value.id == $nbNeuron){
              $scope.neuronObj.splice($key, 1);
            }
          });
          $scope.toJSON();
        } else {
          bootbox.alert("You must remove dependant ptotocol of this neuron before remove it.");
        }
      });
    };

    $scope.removeProtocol = function($nbProtocol){
      angular.forEach($scope.protocolObj, function($value, $key) {
      if($value.id == $nbProtocol){
          $scope.protocolObj.splice($key, 1);
        }
      });
      $scope.toJSON();
    };

    $scope.toJSON = function() { //convert object to JSON and save it in database
      var id_exp = $routeParams.eID;
      var $prevJSONContentEvent = '';

      $scope.jsonContentTimeLine = '{ "objects" : ' + angular.toJson($scope.timeLineObj) + '}';
      $scope.jsonContentEvent = '{ "objects" : ' + angular.toJson($scope.eventObj) + '}';        
      $scope.jsonContentElectrode = '{ "objects" : ' + angular.toJson($scope.electrodeObj) + '}';
      
      $scope.jsonContentNeuron = '{ "objects" : ' + angular.toJson($scope.neuronObj) + '}';
      $scope.jsonContentCell = '{ "objects" : ' + angular.toJson($scope.cellObj) + '}';

      $scope.jsonContentProtocol = '{ "objects" : ' + angular.toJson($scope.protocolObj) + '}';        

      //clear tabs of epoch
      timeLine.put({experiment__id:id_exp}, $scope.jsonContentTimeLine , function(){}).$promise.then(function(val) {
        events.put( $scope.jsonContentEvent, function(){} );
        electrode.put( $scope.jsonContentElectrode, function(){} ).$promise.then(function(val) {
          $rootScope.electrodeObj = val.objects;
            Cell.put($scope.jsonContentCell, function(){} ).$promise.then(function(val1){
              neuron.put( $scope.jsonContentNeuron, function(){} ).$promise.then(function(val2) {

                $rootScope.neuronObj = val2.objects;
                protocol.put( $scope.jsonContentProtocol, function(val3){
                  $rootScope.protocolObj = val3.objects;
                  if($rootScope.spin == 1){
                    setTimeout(function(){ angular.element(window).spin(); }, 3500);
                  }
                  $rootScope.spin = 0;
                });
              });
            });
          });
        });
      }

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
      $scope.electrodeObj = [];
      $scope.neuronObj = [];
      $scope.protocolObj = [];
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
            $timeStampEvtMin = $scope.dateStartExp0.valueOf();
            //if($timeStampEvtMax < $dateEvt.valueOf()){
              $timeStampEvtMax = $dateEvt.valueOf();
            //}
            $diffTSEvt = (($timeStampEvtMax/1e3|0) - ($timeStampEvtMin/1e3|0))/$scl_coef; ///60
          } else {
            $diffTSEvt = 0;
          }
          if( value != null ){
              $nCol = value.timeline.split('/');
              $numberCol = $nCol[3];
              $dateEvt = new Date(value.date);
              $dateFormat = $dateEvt.format('dd/mm/yyyy - HH:MM');
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
          var $link_epoch = "";
          switch($type_epoch){
            case "neuron":
              $link_epoch = value.electrode;
              // récupérer nom de l'electrode
              $scope.getNameElectrode(value.electrode, $q);
            break;
            case "protocol":
              $link_epoch = value.neuron;
              //récupérer nom neuron
              $scope.getNameNeuron(value.neuron, $q);
            break;
          }
          if($scope.TLExp.indexOf(value.timeline) != -1){
            $startEpoch = new Date(value.start);
            $timeStampEvtMin = $scope.dateStartExp0.valueOf();

            //if($timeStampEvtMax < $startEpoch.valueOf()){
              $timeStampEvtMax = $startEpoch.valueOf();
            //}
            $diffTSEpoch = (($timeStampEvtMax/1e3|0) - ($timeStampEvtMin/1e3|0))/$scl_coef; ///60
          } else {
            $diffTSEpoch = 0;
          }

          if( value != null ){
              $nCol = value.timeline.split('/');
              $numberCol = $nCol[3];
              $startEpoch = new Date(value.start);
              $startFormat = $startEpoch.format('dd/mm/yyyy - HH:MM');
              if(value.end != null){
                $endEpoch = new Date(value.end);
                $endFormat = $endEpoch.format('dd/mm/yyyy - HH:MM');
                switch($type_epoch){
                  case "electrode":
                    $scope.addElectrode($numberCol, value.text, $startEpoch, $startFormat, value.type, $diffTSEpoch, $scl_coef, $endEpoch, $endFormat, $link_epoch);
                  break;
                  case "neuron":
                    $scope.addNeuron($numberCol, value.text, $startEpoch, $startFormat, value.type, $diffTSEpoch, $scl_coef, $endEpoch, $endFormat, $link_epoch);
                  break;
                  case "protocol":
                    $scope.addProtocol($numberCol, value.text, $startEpoch, $startFormat, value.type, $diffTSEpoch, $scl_coef, $endEpoch, $endFormat, $link_epoch);
                  break;
                }
              } else {
                switch($type_epoch){
                  case "electrode":
                    $scope.addElectrode($numberCol, value.text, $startEpoch, $startFormat, value.type, $diffTSEpoch, $scl_coef, null, null, $link_epoch);
                  break;
                  case "neuron":
                    $scope.addNeuron($numberCol, value.text, $startEpoch, $startFormat, value.type, $diffTSEpoch, $scl_coef, null, null, $link_epoch);
                  break;
                  case "protocol":
                    $scope.addProtocol($numberCol, value.text, $startEpoch, $startFormat, value.type, $diffTSEpoch, $scl_coef, null, null, $link_epoch);
                  break;
                }
            }
          }
          $i++;
        });
    };

    $scope.getNameElectrode = function($resource_uri, $q){
      var defered = $q.defer();

      electrode.get(function(){}).$promise.then(function($data){
        angular.forEach($data.objects, function($value){
          if($value.resource_uri == $resource_uri){
            defered.resolve($value.text);
          }
        });
      });
      var promise = defered.promise;
      promise.then(function(result) {
        $rootScope.electrode_text = result;
      });
    };

    $scope.getNameNeuron = function($resource_uri){
      var defered = $q.defer();

      neuron.get(function(){}).$promise.then(function($data){
        angular.forEach($data.objects, function($value){
          if($value.resource_uri == $resource_uri){
            defered.resolve($value.text);
          }
        });
      });
      var promise = defered.promise;
      promise.then(function(result) {
        $rootScope.neuron_text = result;
      });
    };

    $scope.eventZIndex = function($event_id) {
        angular.element(".event").css("z-index", "0");
        angular.element(".epoch").css("z-index", "0");
        angular.element(".event_" + $event_id).css("z-index", "10");
    };

    $scope.electrodeZIndex = function($epoch_id) {
        angular.element(".event").css("z-index", "0");
        angular.element(".epoch").css("z-index", "0");
        angular.element(".electrode_" + $epoch_id).css("z-index", "10");
    };

    $scope.neuronZIndex = function($epoch_id) {
        angular.element(".event").css("z-index", "0");
        angular.element(".epoch").css("z-index", "0");
        angular.element(".neuron_" + $epoch_id).css("z-index", "10");
    };

    $scope.protocolZIndex = function($epoch_id) {
        angular.element(".event").css("z-index", "0");
        angular.element(".epoch").css("z-index", "0");
        angular.element(".protocol_" + $epoch_id).css("z-index", "10");
    };

    $scope.toogleEvtLeft = function() {
      angular.element(".textEventLeft").slideToggle(500);
    };

    $scope.stopExperiment = function() {
      $scope.experiment = Experiment.get({id: $routeParams.eID}, function(data){
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

mod_tlv.controller('AddEventController', [
  '$scope', '$element', 'title', 'close', 
  function($scope, $element, title, close) {

  $scope.text = null;
  $scope.date = null;
  $scope.type = null;
  $scope.title = title;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.

  $scope.beforeClose = function() {
    if($scope.type == null){
      $scope.msgAlert = "Please choose type to create event !";
    } else {
      $scope.close();
    }
  };

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

  $scope.selectDayOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
  $scope.selectMonthOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  $scope.selectYearOpt = ['2014', '2015', '2016', '2016', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031'];
  $scope.selectHourOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
  $scope.selectMinOpt = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'];

  $d = evt_date.getDate();
  $scope.evt_day = $d > 9 ? "" + $d: "0" + $d;
  $m = evt_date.getMonth() + 1;
  $scope.evt_month = $m > 9 ? "" + $m: "0" + $m;
  $y = evt_date.getFullYear();
  $scope.evt_year = $y > 9 ? "" + $y: "0" + $y;
  $h = evt_date.getHours();
  $scope.evt_hour = $h > 9 ? "" + $h: "0" + $h;
  $min = evt_date.getMinutes();
  $scope.evt_min = $min > 9 ? "" + $min: "0" + $min;

  $scope.type = evt_type;
  $scope.title = title;
  $scope.del_evt = false;

  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  //$date = new Date($date);
  $scope.close = function() {
    $scope.getDateData();
    close({
      text: $scope.text,
      evt_date: $scope.evt_date,
      type: $scope.type,
      del_evt: $scope.del_evt,
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function() {
    //  Manually hide the modal.
    $element.modal('hide');
    $scope.getDateData();
    //  Now call close, returning control to the caller.
    close({
      text: $scope.text,
      evt_date: $scope.evt_date,
      type: $scope.type,
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  $scope.getDateData = function() {
    $day = angular.element('#datetimepicker_day_'+$scope.evt_id+' option:selected').text();
    $month = angular.element('#datetimepicker_month_'+$scope.evt_id+' option:selected').text();
    $year = angular.element('#datetimepicker_year_'+$scope.evt_id+' option:selected').text();
    $hour = angular.element('#datetimepicker_hour_'+$scope.evt_id+' option:selected').text();
    $min = angular.element('#datetimepicker_min_'+$scope.evt_id+' option:selected').text();
    $scope.evt_date = $day+"/"+$month+"/"+$year+" "+$hour+":"+$min;
  };

  $scope.delete = function(){
    $scope.del_evt = true;
    $scope.close();
  };

  $scope.displayDatePicker = function($evt_id) {
    angular.element('#datetimepicker_'+$evt_id).datetimepicker({
        locale: 'en-gb'
    });
  };
}]);

mod_tlv.controller('AddElectrodeController', [
  '$scope', '$element', 'title', 'electrodeObj', 'DeviceType', 'close', 
  function($scope, $element, title, electrodeObj, DeviceType, close) {

  $scope.lstTypeElectrode = DeviceType.get();
  $scope.text = null;
  $scope.type = null;
  $scope.title = title;
  $scope.electrodeObj = electrodeObj;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.beforeClose = function() {
    if($scope.type == null){
      $scope.msgAlert = "Please choose type to create electrode !";
    } else {
      $scope.close();
    }
  };

  $scope.close = function() {
    close({
      text: $scope.text,
      type: $scope.type,
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
      type: $scope.type,
    }, 100); // close, but give 500ms for bootstrap to animate
  };
}]);

mod_tlv.controller('AddNeuronController', [
  '$scope', '$element', 'title', 'neuronObj', 'electrodeObjList', 'CellType', 'close', 
  function($scope, $element, title, neuronObj, electrodeObjList, CellType, close) {

  $scope.lstTypeNeuron = CellType.get();

  $scope.text = null;
  $scope.type = null;
  $scope.title = title;
  $scope.link_electrode = null;
  $scope.neuronObj = neuronObj;
  $scope.electrodeObjList = electrodeObjList;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.beforeClose = function() {
    //$link_electrode = angular.element('#link_electrode').val();
    $link_electrode = $scope.link_electrode;
    if($scope.type == null){
      $scope.msgAlert = "Please choose type to create neuron !";
    } else if(($link_electrode == "null") | ($link_electrode == null)){
      $scope.msgAlert = "A neuron must be linked to an electrode";
    } else {
      $scope.close();
    }
  };

  $scope.close = function() {
    //$link_electrode = angular.element('#link_electrode').val();
    $link_electrode = $scope.link_electrode;
    close({
      text: $scope.text,
      type: $scope.type,
      link_electrode: $link_electrode,
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function() {
    //  Manually hide the modal.
    $element.modal('hide');
    //  Now call close, returning control to the caller.
    //$link_electrode = angular.element('#link_electrode').val();
    $link_electrode = $scope.link_electrode;
    close({
      text: $scope.text,
      type: $scope.type,
      link_electrode: $link_electrode,
    }, 100); // close, but give 500ms for bootstrap to animate
  };
}]);

mod_tlv.controller('AddProtocolController', [
  '$scope', '$element', 'title', 'protocolObj', 'neuronObjList', 'close',
  function($scope, $element, title, protocolObj, neuronObjList, close) {

  $scope.text = null;
  $scope.type = null;
  $scope.title = title;
  $scope.link_neuron = null;
  $scope.protocolObj = protocolObj;
  $scope.neuronObjList = neuronObjList;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.beforeClose = function() {
    //$link_neuron = angular.element('#link_neuron').val();
    $link_neuron = $scope.link_neuron;
    if($scope.type == null){
      $scope.msgAlert = "Please choose type to create protocol !";
    } else if(($link_neuron == "null") | ($link_neuron == null)){
      $scope.msgAlert = "A protocol must be linked to a neuron";
    } else {
      $scope.close();
    }
  };

  $scope.close = function() {
    //$link_neuron = angular.element('#link_neuron').val();
    $link_neuron = $scope.link_neuron;
    close({
      text: $scope.text,
      type: $scope.type,
      link_neuron: $link_neuron,
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function() {
    //  Manually hide the modal.
    $element.modal('hide');
    //  Now call close, returning control to the caller.
    //$link_neuron = angular.element('#link_neuron').val();
    $link_neuron = $scope.link_neuron;
    close({
      text: $scope.text,
      type: $scope.type,
      link_neuron: $link_neuron,
    }, 100); // close, but give 500ms for bootstrap to animate
  };
}]);

mod_tlv.controller('EditEpochController', [
  '$scope', '$element', 'title', 'epoch_text', 'epoch_type', 'epoch_start', 'epoch_end', 'epoch_id', 'epochObj', 'epochObjList', 'type_epoch', 'link_epoch', 'DeviceType', 'CellType', 'close', 
  function($scope, $element, title, epoch_text, epoch_type, epoch_start, epoch_end, epoch_id, epochObj, epochObjList, type_epoch, link_epoch, DeviceType, CellType, close) {

  $scope.selectDayOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
  $scope.selectMonthOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  $scope.selectYearOpt = ['2014', '2015', '2016', '2016', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031'];
  $scope.selectHourOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
  $scope.selectMinOpt = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'];

  $scope.text = epoch_text;
  $scope.epoch_id = epoch_id;
  $d = epoch_start.getDate();
  $scope.start_day = $d > 9 ? "" + $d: "0" + $d;
  $m = epoch_start.getMonth() + 1;
  $scope.start_month = $m > 9 ? "" + $m: "0" + $m;
  $y = epoch_start.getFullYear();
  $scope.start_year = $y > 9 ? "" + $y: "0" + $y;
  $h = epoch_start.getHours();
  $scope.start_hour = $h > 9 ? "" + $h: "0" + $h;
  $min = epoch_start.getMinutes();
  $scope.start_min = $min > 9 ? "" + $min: "0" + $min;

  if(epoch_end != null){
    $d = epoch_end.getDate();
    $scope.end_day = $d > 9 ? "" + $d: "0" + $d;
    $m = epoch_end.getMonth() + 1;
    $scope.end_month = $m > 9 ? "" + $m: "0" + $m;
    $y = epoch_end.getFullYear();
    $scope.end_year = $y > 9 ? "" + $y: "0" + $y;
    $h = epoch_end.getHours();
    $scope.end_hour = $h > 9 ? "" + $h: "0" + $h;
    $min = epoch_end.getMinutes();
    $scope.end_min = $min > 9 ? "" + $min: "0" + $min;
  }
  $scope.type = epoch_type;
  $scope.title = title;
  $scope.del_epoch = false;
  $scope.stop_epoch = false;
  $scope.link_epoch = link_epoch;
  $scope.type_epoch = type_epoch;
  $scope.epochObj = epochObj;
  $scope.epochObjList = epochObjList;
  $scope.lstTypeObj = [];
  
  if($scope.type_epoch == "electrode"){
    $scope.lstType = DeviceType.get();
  }
  if($scope.type_epoch == "neuron"){
    $scope.lstType = CellType.get();
  }
  /*if($scope.type_epoch == "protocol"){
    $tabLstType = ["type1", "type2", "type3", "type4", "type5"]

    angular.forEach($tabLstType, function($value){
      $scope.lstTypeObj.push (
        {
          name: $value,
        }
      );
    });
    $scope.lstType = '{ "objects" : ' + angular.toJson($scope.lstTypeObj) + '}';
  }*/
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
    $scope.getDateData();
    close({
      text: $scope.text,
      epoch_start: $scope.epoch_start,
      epoch_end: $scope.epoch_end,
      type: $scope.type,
      del_epoch: $scope.del_epoch,
      stop_epoch: $scope.stop_epoch,
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function() {
    //  Manually hide the modal.
    $element.modal('hide');
    $scope.getDateData();
    //  Now call close, returning control to the caller.
    close({
      text: $scope.text,
      epoch_start: $scope.epoch_start,
      epoch_end: $scope.epoch_end,
      type: $scope.type,
      link_epoch: $link_epoch,
      type_epoch: $scope.type_epoch,
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  $scope.getDateData = function() {
    $day = $scope.start_day;
    $month = $scope.start_month;
    $year = $scope.start_year;
    $hour = $scope.start_hour;
    $min = $scope.start_min;
    $scope.epoch_start = $day+"/"+$month+"/"+$year+" "+$hour+":"+$min;

    $day = $scope.end_day;
    $month = $scope.end_month;
    $year = $scope.end_year;
    $hour = $scope.end_hour;
    $min = $scope.end_min;
    if(($day === undefined) | ($month === undefined) | ($year === undefined) | ($hour === undefined) | ($min === undefined)){
      $scope.epoch_end = "";
    } else {
      $scope.epoch_end = $day+"/"+$month+"/"+$year+" "+$hour+":"+$min;
    }
  };

  $scope.delete = function(){
    $scope.del_epoch = true;
    $scope.close();
  };

  $scope.stop = function(){
    $scope.stop_epoch = true;
    $scope.close();
  };

  $scope.displayDatePicker = function($epoch_id, $start_end) {
    if($start_end == "start"){
      angular.element('#datetimepicker_start_'+$epoch_id).datetimepicker({
          locale: 'en-gb'
      });
    } else if ($start_end == "end"){
      angular.element('#datetimepicker_end_'+$epoch_id).datetimepicker({
          locale: 'en-gb'
      });
    }
  };
}]);