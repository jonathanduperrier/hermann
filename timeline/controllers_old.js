
var mod_tlv = angular.module('mod_tlv', ['ui.bootstrap', 
                                         'angularModalService', 
                                         'timeLineServices', 
                                         'eventServices',
                                         'electrodeServices',
                                         'neuronServices',
                                         'protocolServices',
                                         'hermann.experiments',
                                         'CellTypeService',
                                         'DeviceTypeService',
                                         'SupplierService'
                                         ]);


mod_tlv.controller('timeLineVisualController', 
function ($scope, $rootScope, $compile, ModalService, $http, $q, timeLine, events, electrode, neuron, CellType, DeviceType, protocol, $routeParams, Experiment) {
    $scope.nbEvent = [];
    $scope.timeLineObj = [];
    $scope.eventObj = [];
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
    $scope.heightMinEpoch = 35;
    $rootScope.spin = 0;

    $scope.scale_coef = 60;

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
        angular.element(window).spin();
        $rootScope.spin = 1;
        
        var $dateEvent = new Date();
        var $vPlInit = $scope.dateStartExp0/1e3|0; 
        var $vPl = $dateEvent/1e3|0; 
        var $dateFormat = $dateEvent.format('dd/mm/yyyy - HH:MM');

        $vPlacement = (($vPl - $vPlInit) / $scope.scale_coef); //1px = 60 secondes

        //get id event
        $tabIdEvent = [];
        if(angular.element.isEmptyObject($scope.eventObj)) {
          $idEvent = 1;
        } else {
          angular.forEach($scope.eventObj, function(value){
            $tabIdEvent.push(parseInt(value.id));
          });
          $idEvent = Math.max.apply(Math, $tabIdEvent) + 1;
        }

        $scope.addEvent($idEvent, $numberCol, $text, $dateEvent, $dateFormat, $type, $vPlacement);
        //$scope.toJSON();
        events.post($scope.eventObjUnique).$promise.then(function($data){
          //$scope.displayZoomEvent(1);
          $scope.stopSpin();
        });
    };

    $scope.addEvent = function($idEvent, $numberCol, $text, $dateEvent, $dateFormat, $type, $vPlacement){
        var $i=0;
        var $TLexp = "";
        var $TLcolor = "";
        angular.forEach($scope.timeLineObj, function($value, $key){
          if($numberCol == $scope.timeLineObj[$key].id){
            $TLexp = $scope.timeLineObj[$key].experiment;
            $TLcolor = $scope.timeLineObj[$key].color;
          }
          //if(($vPlacement+150) > $scope.timeLineObj[$key].height){
            $scope.timeLineObj[$key].height = $vPlacement+150;
            angular.element("#graduation").height($vPlacement+150);
          //}
          $i++;
        });

        $scope.eventObjUnique = {
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
        };

        $scope.eventObj.push ( $scope.eventObjUnique );
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
        $('#event_' + $nbEvent).remove();        
        angular.forEach($scope.eventObj, function($value, $key) {
          if($value.id == $nbEvent){
            $scope.eventObj.splice($key, 1);
          }
        });
        id_event = $nbEvent;
        events.del({id:id_event});
        //$scope.toJSON();
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
              //$scope.toJSON();
            }
          }
        });
      });
    };
    $scope.editEvent = function($id, $text, $date, $type){
        var $vPlInit = $scope.dateStartExp0/1e3|0; 
        var $vPl = $date/1e3|0; 
        $vPlacement = (($vPl - $vPlInit) / $scope.scale_coef); //1px = 60 secondes
      angular.forEach($scope.eventObj, function(value, key) {
        if(value.id == $id){
          $scope.eventObj[key].text = $text;
          $scope.eventObj[key].date = $date;
          $scope.eventObj[key].dateFormat = $date.format('dd/mm/yyyy - HH:MM');
          $scope.eventObj[key].type = $type;
          $scope.eventObj[key].vPlacement = $vPlacement;
          id_event = $id;
          $scope.jsonContentEvent = angular.toJson($scope.eventObj[key]);
          events.put({id:id_event}, $scope.jsonContentEvent);
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
          $scope.createElectrode($numberCol, result.label, result.type, result.model, result.version, result.serial_or_id, result.manufacturer, result.notes, result.impedance, result.internal_diameter, result.rows, result.columns, result.step);
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
            $scope.createNeuron($numberCol, result.label, result.type, result.link_electrode, result.properties);
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
          $electrode_label = value.label;
          $electrode_type = value.type;
          //$electrode_type = value.type_name;
          $electrode_start = value.start;
          $electrode_end = value.end;
          $electrode_model = value.model;
          $electrode_version = value.version;
          $electrode_serial_or_id = value.serial_or_id;
          $electrode_manufacturer = value.manufacturer;
          $electrode_notes = value.notes;
          $electrode_impedance = value.impedance;
          $electrode_internal_diameter = value.internal_diameter;
          $electrode_rows = value.rows;
          $electrode_columns = value.columns;
          $electrode_step = value.step;
        }
      });

      ModalService.showModal({
        templateUrl: "timeline/modal_dlg_edit_electrode.tpl.html",
        controller: "EditElectrodeController",
        inputs: {
          title: "Edit Electrode information",
          electrode_id: $electrode_id,
          electrode_label: $electrode_label,
          electrode_type: $electrode_type,
          electrode_start: $electrode_start,
          electrode_end: $electrode_end,
          model: $electrode_model,
          version: $electrode_version,
          serial_or_id: $electrode_serial_or_id,
          manufacturer: $electrode_manufacturer,
          notes: $electrode_notes,
          impedance: $electrode_impedance,
          internal_diameter: $electrode_internal_diameter,
          rows: $electrode_rows,
          columns: $electrode_columns,
          step: $electrode_step,
          electrodeObj: $scope.electrodeObj,
          electrodeObjList: $scope.electrodeObjList,
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {

          from_start = result.electrode_start.split("/");
          to_start = new Date(from_start[1]+"/"+from_start[0]+"/"+from_start[2]);;

          if(result.del_electrode == true){
            $scope.showConfirmRemoveEpoch($electrode_id, "electrode");
          } else if (result.stop_electrode == true){
            $date_end = new Date();
            $scope.editElectrode($nbElectrode, result.label, to_start, $date_end, result.type.resource_uri, result.model, result.version, result.serial_or_id, result.manufacturer.resource_uri, result.impedance, result.internal_diameter, result.rows, result.columns, result.step);
            //$scope.toJSON();
          } else {
            if(result.type == null){
              bootbox.alert("Please choose type to save electrode !");
            } else {
              if(result.electrode_end != ""){
                from_end = result.electrode_end.split("/");
                to_end = new Date(from_end[1]+"/"+from_end[0]+"/"+from_end[2]);
              } else {
                to_end = "";
              }
              $scope.editElectrode($nbElectrode, result.label, to_start, to_end, result.type.resource_uri, result.model, result.version, result.serial_or_id, result.manufacturer.resource_uri, result.impedance, result.internal_diameter, result.rows, result.columns, result.step);
              //$scope.toJSON();
            }
          }
        });
      });
    };

    $scope.showDlgEditNeuron = function($nbNeuron, $timeline_name){
      var $exp = "";
      var $electrodeObjExp = [];

      $restriction = "A neuron must be linked to an electrode";
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
          $neuron_label = value.label;
          $neuron_type = value.type;
          $neuron_start = value.start;
          $neuron_end = value.end;
          $electrode = value.electrode;
          $neuron_properties = value.properties;
        }
      });
      ModalService.showModal({
        templateUrl: "timeline/modal_dlg_edit_neuron.tpl.html",
        controller: "EditNeuronController",
        inputs: {
          title: "Edit Neuron information",
          neuron_id: $neuron_id,
          neuron_label: $neuron_label,
          neuron_type: $neuron_type,
          neuron_start: $neuron_start,
          neuron_end: $neuron_end,
          properties: $neuron_properties,
          link_electrode: $electrode,
          neuronObj: $scope.neuronObj,
          neuronObjList: $scope.neuronObjList,
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {

          from_start = result.neuron_start.split("/");
          to_start = new Date(from_start[1]+"/"+from_start[0]+"/"+from_start[2]);;

          if(result.del_neuron == true){
            $scope.showConfirmRemoveEpoch($neuron_id, "neuron");
          } else if (result.stop_neuron == true){
            $date_end = new Date();
            $scope.editNeuron($nbNeuron, result.label, to_start, $date_end, result.type, result.properties);
          } else {
            if(result.type == null){
              bootbox.alert("Please choose type to save neuron !");
            } else {
              if(result.neuron_end != ""){
                from_end = result.neuron_end.split("/");
                to_end = new Date(from_end[1]+"/"+from_end[0]+"/"+from_end[2]);
              } else {
                to_end = "";
              }
              $scope.editNeuron($nbNeuron, result.label, to_start, to_end, result.type, result.properties);
            }
          }
        });
      });
    };

    $scope.showDlgEditProtocol = function($nbProtocol, $timeline_name){
      var $exp = "";
      var $protocolObjExp = [];

      $restriction = "A protocol must be linked to an electrode";
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
          $neuron = value.neuron;
        }
      });

      ModalService.showModal({
        templateUrl: "timeline/modal_dlg_edit_protocol.tpl.html",
        controller: "EditProtocolController",
        inputs: {
          title: "Edit Protocol information",
          protocol_id: $protocol_id,
          protocol_text: $protocol_text,
          protocol_type: $protocol_type,
          protocol_start: $protocol_start,
          protocol_end: $protocol_end,
          link_neuron: $neuron,
          protocolObj: $scope.protocolObj,
          protocolObjList: $scope.protocolObjList,
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {

          from_start = result.protocol_start.split("/");
          to_start = new Date(from_start[1]+"/"+from_start[0]+"/"+from_start[2]);;

          if(result.del_protocol == true){
            $scope.showConfirmRemoveEpoch($protocol_id, "protocol");
          } else if (result.stop_protocol == true){
            $date_end = new Date();
            $scope.editProtocol($nbProtocol, result.text, to_start, $date_end, result.type);
            //$scope.toJSON();
          } else {
            if(result.type == null){
              bootbox.alert("Please choose type to save protocol !");
            } else {
              if(result.protocol_end != ""){
                from_end = result.protocol_end.split("/");
                to_end = new Date(from_end[1]+"/"+from_end[0]+"/"+from_end[2]);
              } else {
                to_end = "";
              }
              $scope.editProtocol($nbProtocol, result.text, to_start, to_end, result.type);
              //$scope.toJSON();
            }
          }
        });
      });
    };

    $scope.editElectrode = function($id, $text, $start, $end, $type, $model, $version, $serial_or_id, $manufacturer, $impedance, $internal_diameter, $rows, $columns, $step){
      DeviceType.get(function($data){
        angular.forEach($data.objects, function($value){
          if($value.resource_uri == $type){
            $type_name = $value.name;
            //$type_name = $data.objects[0].name;
          }
        });

        var $vPlInit = $scope.dateStartExp0/1e3|0; 
        var $vPl = $start/1e3|0; 
        $vPlacement = (($vPl - $vPlInit) / $scope.scale_coef); //1px = 60 secondes*/

        $startElectrodeTS = $start.valueOf();
        $endElectrodeTS = $end.valueOf();
        $diffTSElectrode = (($endElectrodeTS/1e3|0) - ($startElectrodeTS/1e3|0)) / $scope.scale_coef;
        if($diffTSElectrode < ($scope.heightMinEpoch+1)){
          $diffTSElectrode = $scope.heightMinEpoch;
        }
        angular.forEach($scope.electrodeObj, function(value, key) {
          if((value.id == $id)){
            $scope.electrodeObj[key].label = $text;
            $scope.electrodeObj[key].start = $start;
            $scope.electrodeObj[key].startFormat = $start.format('dd/mm/yyyy - HH:MM');
            if($end != ""){
              $scope.electrodeObj[key].end = $end;
              $scope.electrodeObj[key].endFormat = $end.format('dd/mm/yyyy - HH:MM');
            }
            $scope.electrodeObj[key].type = $type.resource_uri;
            $scope.electrodeObj[key].type_name = $type_name;
            //$model, $version, $serial_or_id, $manufacturer, $impedance, $internal_diameter, $rows, $columns, $step
            $scope.electrodeObj[key].model = $model;
            $scope.electrodeObj[key].version = $version;
            $scope.electrodeObj[key].serial_or_id = $serial_or_id;
            $scope.electrodeObj[key].manufacturer = $manufacturer;
            $scope.electrodeObj[key].impedance = $impedance;
            $scope.electrodeObj[key].internal_diameter = $internal_diameter;
            $scope.electrodeObj[key].rows = $rows;
            $scope.electrodeObj[key].columns = $columns;
            $scope.electrodeObj[key].step = $step;
            $scope.electrodeObj[key].epoch_height = $diffTSElectrode;
            $scope.electrodeObj[key].vPlacement = $vPlacement;
            id_electrode = $id;
            $scope.jsonContentElectrode = angular.toJson($scope.electrodeObj[key]);
            electrode.put({id:id_electrode}, $scope.jsonContentElectrode);
          }
        });

        angular.forEach($scope.timeLineObj, function($value, $key){
          $scope.timeLineObj[$key].height = $vPlacement+$diffTSElectrode+150;
          angular.element("#graduation").height($vPlacement+$diffTSElectrode+150);
          $i++;
        });
      });
    };

    $scope.editNeuron = function($id, $label, $start, $end, $type, $properties){
      CellType.get(function($data){
        angular.forEach($data.objects, function($value){
          if($value.resource_uri == $type){
            $type_name = $value.name;
          }
        });
        var $vPlInit = $scope.dateStartExp0/1e3|0; 
        var $vPl = $start/1e3|0; 
        $vPlacement = (($vPl - $vPlInit) / $scope.scale_coef); //1px = 60 secondes

        $startNeuronTS = $start.valueOf();
        $endNeuronTS = $end.valueOf();
        $diffTSNeuron = (($endNeuronTS/1e3|0) - ($startNeuronTS/1e3|0)) / $scope.scale_coef;
        if($diffTSNeuron < ($scope.heightMinEpoch+1)){
          $diffTSNeuron = $scope.heightMinEpoch;
        }
        angular.forEach($scope.neuronObj, function(value, key) {
          if(value.id == $id){
            $scope.neuronObj[key].label = $label;
            $scope.neuronObj[key].start = $start;
            $scope.neuronObj[key].startFormat = $start.format('dd/mm/yyyy - HH:MM');
            if($end != ""){
              $scope.neuronObj[key].end = $end;
              $scope.neuronObj[key].endFormat = $end.format('dd/mm/yyyy - HH:MM');
            }
            $scope.neuronObj[key].type = $type;
            $scope.neuronObj[key].type_name = $type_name;
            $scope.neuronObj[key].epoch_height = $diffTSNeuron;
            $scope.neuronObj[key].vPlacement = $vPlacement;
            $scope.neuronObj[key].properties = $properties;
            id_neuron = $id;
            $scope.jsonContentNeuron = angular.toJson($scope.neuronObj[key]);
            neuron.put({id:id_neuron}, $scope.jsonContentNeuron);
          }
        });
        angular.forEach($scope.timeLineObj, function($value, $key){
          $scope.timeLineObj[$key].height = $vPlacement+$diffTSNeuron+150;
          angular.element("#graduation").height($vPlacement+$diffTSNeuron+150);
          $i++;
        });
      });
    };

    $scope.editProtocol = function($id, $text, $start, $end, $type){
      var $vPlInit = $scope.dateStartExp0/1e3|0; 
      var $vPl = $start/1e3|0; 
      $vPlacement = (($vPl - $vPlInit) / $scope.scale_coef); //1px = 60 secondes*/

      $startProtocolTS = $start.valueOf();
      $endProtocolTS = $end.valueOf();
      $diffTSProtocol = (($endProtocolTS/1e3|0) - ($startProtocolTS/1e3|0)) / $scope.scale_coef;
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
          id_protocol = $id;
          $scope.jsonContentProtocol = angular.toJson($scope.protocolObj[key]);
          protocol.put({id:id_protocol}, $scope.jsonContentProtocol);
        }
      });
      angular.forEach($scope.timeLineObj, function($value, $key){
        $scope.timeLineObj[$key].height = $vPlacement+$diffTSProtocol+150;
        angular.element("#graduation").height($vPlacement+$diffTSProtocol+150);
        $i++;
      });
    };

    $scope.createElectrode = function($numberCol, $text, $type, $model, $version, $serial_or_id, $manufacturer, $notes, $impedance, $internal_diameter, $rows, $columns, $step){
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

        $vPlacement = (($vPl - $vPlInit) / $scope.scale_coef); //1px = 60 secondes

        $tabIdElectrode = [];
        if(angular.element.isEmptyObject($scope.electrodeObj)) {
          $idElectrode = 1;
        } else {
          angular.forEach($scope.electrodeObj, function(value){
            $tabIdElectrode.push(parseInt(value.id));
          });
          $idElectrode = Math.max.apply(Math, $tabIdElectrode) + 1;
        }
        $scope.addElectrode($idElectrode, $numberCol, $text, $startElectrode, $startFormat, $type.resource_uri, $vPlacement, 60, null, null, $model, $version, $serial_or_id, $manufacturer.resource_uri, $notes, $impedance, $internal_diameter, $rows, $columns, $step, 1);
    };

    $scope.createNeuron = function($numberCol, $label, $type, $electrode, $properties){
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

      $tabIdNeuron = [];
      if(angular.element.isEmptyObject($scope.neuronObj)) {
        $idNeuron = 1;
      } else {
        angular.forEach($scope.neuronObj, function(value){
          $tabIdNeuron.push(parseInt(value.id));
        });
        $idNeuron = Math.max.apply(Math, $tabIdNeuron) + 1;
      }

      promise.then(function(result) {
        $scope.nbEpoch = result;
        $vPlacement = (($vPl - $vPlInit) / $scope.scale_coef); //1px = 60 secondes
        $scope.addNeuron($idNeuron, $numberCol, $label, $startNeuron, $startFormat, $type, $vPlacement, 60, null, null, $electrode, $properties, 1);
      });
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

      $vPlacement = (($vPl - $vPlInit) / $scope.scale_coef); //1px = 60 secondes

      $tabIdProtocol = [];
      if(angular.element.isEmptyObject($scope.protocolObj)) {
        $idProtocol = 1;
      } else {
        angular.forEach($scope.protocolObj, function(value){
          $tabIdProtocol.push(parseInt(value.id));
        });
        $idProtocol = Math.max.apply(Math, $tabIdProtocol) + 1;
      }

      $scope.addProtocol($idProtocol, $numberCol, $text, $startProtocol, $startFormat, $type, $vPlacement, 60, null, null, $neuron);
      //$scope.toJSON();
      protocol.post( $scope.protocolObjUnique ).$promise.then(function($data){
        //$scope.displayZoomEvent(1);
        $scope.stopSpin();
      });
    };

    $scope.getExistingElectrodeOnTimeLine = function($numberCol){
      $date_end = new Date();
      electrode.get(function(){}).$promise.then(function($data){
        angular.forEach($data.objects, function($value){
          $resource_uri_splitted = $value.resource_uri.split('/');
          $date_start = new Date($value.start);
          $id = $resource_uri_splitted[3];
          if(($value.timeline == "/notebooks/timeline/" + $numberCol) & ($value.end == null)){
            $scope.editElectrode($id, $value.text, $date_start, $date_end, $value.type, $value.model, $value.version, $value.serial_or_id, $value.manufacturer, $value.impedance, $value.internal_diameter, $value.rows, $value.columns, $value.step);
            //$scope.toJSON();
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
            $scope.editNeuron($id, $value.label, $date_start, $date_end, $value.type, $value.properties);
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
            //$scope.toJSON();
            $scope.nbProtocol++;
          }
        });
        $scope.defered.resolve($scope.nbProtocol);
      });
    };

    $scope.addElectrode = function($idElectrode, $numberCol, $label, $startElectrode, $startFormat, $type, $vPlacement, $endElectrode, $endFormat, $model, $version, $serial_or_id, $manufacturer, $notes, $impedance, $internal_diameter, $rows, $columns, $step, $creation){
      DeviceType.get({name:$type.name}, function($data){
        angular.forEach($data.objects, function($value){
          if($value.resource_uri == $type){
            $type_name = $value.name;
            //$type_name = $data.objects[0].name;
          }
        });

        var $i=0;
        var $TLexp = "";
        var $TLcolor = "";
        var $TLName = "";

        if($endElectrode != null){
          $startElectrodeTS = $startElectrode.valueOf();
          $endElectrodeTS = $endElectrode.valueOf();
          $diffTSElectrode = (($endElectrodeTS/1e3|0) - ($startElectrodeTS/1e3|0)) / $scope.scale_coef;
          if($diffTSElectrode < ($scope.heightMinEpoch+1)){
            $diffTSElectrode = $scope.heightMinEpoch;
          }
        } else {
          $diffTSElectrode = $scope.heightMinEpoch;
        }

        angular.forEach($scope.timeLineObj, function($value, $key){
          if($numberCol == $scope.timeLineObj[$key].id){
            $TLexp = $scope.timeLineObj[$key].experiment;
            $TLcolor = $scope.timeLineObj[$key].color;
            $TLName =  $scope.timeLineObj[$key].name;
          }
          $exp = $scope.getExpFromTimeline($numberCol);
          if($scope.timeLineObj[$key].experiment == $exp){
            if(($vPlacement+$diffTSElectrode+150) > $scope.timeLineObj[$key].height){
              $scope.timeLineObj[$key].height = $vPlacement+$diffTSElectrode+150;
              angular.element("#graduation").height($vPlacement+$diffTSElectrode+150);
            }
          }
          $i++;
        });

        $scope.electrodeObjUnique =
          {
              id : $idElectrode,
              timeline : "/notebooks/timeline/" + $numberCol,
              label : $label,
              start : $startElectrode,
              startFormat : $startFormat,
              type : $type,
              type_name : $type_name,
              color : "#FFE500",
              vPlacement : $vPlacement,
              TimeLineExp : '#/timeline' + $TLexp,
              UrlExp : window.location.hash,
              TimeLineColor : $TLcolor,
              TimeLineName : $TLName,
              end : $endElectrode, 
              endFormat : $endFormat,
              epoch_height : $diffTSElectrode,
              model: $model,
              version: $version,
              serial_or_id: $serial_or_id,
              manufacturer: $manufacturer,
              notes: $notes,
              impedance: $impedance,
              internal_diameter: $internal_diameter,
              rows: $rows,
              columns: $columns,
              step: $step,
          };
        $scope.electrodeObj.push ( $scope.electrodeObjUnique );

        if($creation == 1){
          electrode.post($scope.electrodeObjUnique, function(){
            //$scope.displayZoomEvent(1);
            $scope.stopSpin();
          });
        }
      });
    };

    $scope.addNeuron = function($idNeuron, $numberCol, $label, $startNeuron, $startFormat, $type, $vPlacement, $endNeuron, $endFormat, $electrode, $properties, $creation){
      CellType.get(function($data){
        angular.forEach($data.objects, function($value){
          if($value.resource_uri == $type){
            $type_uri = $value.resource_uri;
            $type_name = $value.name;
          }
        });

        var $i=0;
        var $TLexp = "";
        var $TLcolor = "";
        var $TLName = "";

        if($endNeuron != null){
          $startNeuronTS = $startNeuron.valueOf();
          $endNeuronTS = $endNeuron.valueOf();
          $diffTSNeuron = (($endNeuronTS/1e3|0) - ($startNeuronTS/1e3|0)) / $scope.scale_coef;
          if($diffTSNeuron < ($scope.heightMinEpoch+1)){
            $diffTSNeuron = $scope.heightMinEpoch;
          }
        } else {
          $diffTSNeuron = $scope.heightMinEpoch;
        }

        angular.forEach($scope.timeLineObj, function($value, $key){
          if($numberCol == $scope.timeLineObj[$key].id){
            $TLexp = $scope.timeLineObj[$key].experiment;
            $TLcolor = $scope.timeLineObj[$key].color;
            $TLName =  $scope.timeLineObj[$key].name;
          }
          $exp = $scope.getExpFromTimeline($numberCol);
          if($scope.timeLineObj[$key].experiment == $exp){
            if(($vPlacement+$diffTSNeuron+150) > $scope.timeLineObj[$key].height){
              $scope.timeLineObj[$key].height = $vPlacement+$diffTSNeuron+150;
              angular.element("#graduation").height($vPlacement+$diffTSNeuron+150);
            }
          }
          $i++;
        });

        $scope.neuronObjUnique =
            {
                id : $idNeuron,
                timeline : "/notebooks/timeline/" + $numberCol,
                label : $label,
                start : $startNeuron,
                startFormat : $startFormat,
                type : $type_uri,
                type_name : $type_name,
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
                properties : $properties,
           };
        $scope.neuronObj.push ( $scope.neuronObjUnique );
        if($creation == 1){
          //$scope.toJSON();
          neuron.post($scope.neuronObjUnique).$promise.then(function($data){
            //$scope.displayZoomEvent(1);
            $scope.stopSpin();
          });
        }
      });
    };

    $scope.addProtocol = function($idProtocol, $numberCol, $text, $startProtocol, $startFormat, $type, $vPlacement, $endProtocol, $endFormat, $neuron){

      var $i=0;
      var $TLexp = "";
      var $TLcolor = "";
      var $TLName = "";

      if($endProtocol != null){
        $startProtocolTS = $startProtocol.valueOf();
        $endProtocolTS = $endProtocol.valueOf();
        $diffTSProtocol = (($endProtocolTS/1e3|0) - ($startProtocolTS/1e3|0)) / $scope.scale_coef;
        if($diffTSProtocol < ($scope.heightMinEpoch+1)){
          $diffTSProtocol = $scope.heightMinEpoch;
        }
      } else {
        $diffTSProtocol = $scope.heightMinEpoch;
      }

      angular.forEach($scope.timeLineObj, function($value, $key){
        if($numberCol == $scope.timeLineObj[$key].id){
          $TLexp = $scope.timeLineObj[$key].experiment;
          $TLcolor = $scope.timeLineObj[$key].color;
          $TLName =  $scope.timeLineObj[$key].name;
        }
        $exp = $scope.getExpFromTimeline($numberCol);
        if($scope.timeLineObj[$key].experiment == $exp){
          if(($vPlacement+$diffTSProtocol+150) > $scope.timeLineObj[$key].height){
            $scope.timeLineObj[$key].height = $vPlacement+$diffTSProtocol+150;
            angular.element("#graduation").height($vPlacement+$diffTSProtocol+150);
          }
        }
        $i++;
      });

      $scope.protocolObjUnique =
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
          };
        $scope.protocolObj.push ( $scope.protocolObjUnique );
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
          if($value.electrode == "/notebooks/electrode/"+$nbElectrode) {
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
          id_electrode = $nbElectrode;
          electrode.del({id:id_electrode});
          //$scope.toJSON();
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
          id_neuron = $nbNeuron;
          neuron.del({id:id_neuron});
          //$scope.toJSON();
        } else {
          bootbox.alert("You must remove dependant protocol of this neuron before remove it.");
        }
      });
    };

    $scope.removeProtocol = function($nbProtocol){
      angular.forEach($scope.protocolObj, function($value, $key) {
      if($value.id == $nbProtocol){
          $scope.protocolObj.splice($key, 1);
        }
      });
      id_protocol = $nbProtocol;
      protocol.del({id:id_protocol});
      //$scope.toJSON();
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
              protocol.put( $scope.jsonContentProtocol, function(){}).$promise.then(function(val3) {
                $rootScope.protocolObj = val3.objects;
                $scope.stopSpin();
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
      switch($scale){
        case 0:
          $scope.scale_coef = 1;
          break;
        case 1:
          $scope.scale_coef = 60;
          break;
        case 2:
          $scope.scale_coef = 3600;
          break;
      }

      angular.element('.event').remove();
      $scope.eventObj = [];
      $scope.electrodeObj = [];
      $scope.neuronObj = [];
      $scope.protocolObj = [];
      $scope.fromJsonEvent();
      $scope.fromJsonEpoch();
    };

    $scope.fromJsonEvent = function () {
        $scope.response = events.get({}, function(data){
        $jsonEvents = angular.fromJson(data.objects);
        $timeStampEvtMax = 0;
        $timeStampEvtMin = 0;
        $diffTSEvt = [];

        $i=0;
        angular.forEach($jsonEvents, function(value, key) {
          if($scope.TLExp.indexOf(value.timeline) != -1){
            $dateEvt = new Date(value.date);
            $timeStampEvtMin = $scope.dateStartExp0.valueOf();
            //if($timeStampEvtMax < $dateEvt.valueOf()){
              $timeStampEvtMax = $dateEvt.valueOf();
            //}
            $diffTSEvt = (($timeStampEvtMax/1e3|0) - ($timeStampEvtMin/1e3|0)) / $scope.scale_coef; ///60
          } else {
            $diffTSEvt = 0;
          }
          if( value != null ){
              $nCol = value.timeline.split('/');
              $numberCol = $nCol[3];
              $dateEvt = new Date(value.date);
              $dateFormat = $dateEvt.format('dd/mm/yyyy - HH:MM');

              $resource_uri_splitted = value.resource_uri.split('/');
              $idEvent = $resource_uri_splitted[3];
              $scope.addEvent($idEvent, $numberCol, value.text, $dateEvt, $dateFormat, value.type, $diffTSEvt);
          }
          $i++;
        });
      });
    };

    $scope.fromJsonEpoch = function(){
      $scope.response = electrode.get({}, function(data){
        $scope.functionFromJsonEpoch(data, "electrode");
        $scope.response = neuron.get({}, function(data){
          $scope.functionFromJsonEpoch(data, "neuron");
          $scope.response = protocol.get({}, function(data){
            $scope.functionFromJsonEpoch(data, "protocol");
          });
        });
      });
    };

    $scope.getDiffTS = function($valTimeLine, $valStart){
      if($scope.TLExp.indexOf($valTimeLine) != -1){
        $startEpoch = new Date($valStart);
        $timeStampEvtMin = $scope.dateStartExp0.valueOf();

        //if($timeStampEvtMax < $startEpoch.valueOf()){
          $timeStampEvtMax = $startEpoch.valueOf();
        //}
        $scope.diffTSEpoch = (($timeStampEvtMax/1e3|0) - ($timeStampEvtMin/1e3|0)) / $scope.scale_coef; ///60
      } else {
        $scope.diffTSEpoch = 0;
      }
    };

    $scope.functionFromJsonEpoch = function(data, $type_epoch){
        $scope.jsonEpoch = angular.fromJson(data.objects);
        $timeStampEvtMax = 0;
        $timeStampEvtMin = 0;
        $scope.diffTSEpoch = 0;

        $i=0;
        angular.forEach($scope.jsonEpoch, function(value, key) {
          var $link_epoch = "";
          switch($type_epoch){
            case "neuron":
              $link_epoch = value.electrode;
              $scope.getNameElectrode(value.electrode, $q);
            break;
            case "protocol":
              $link_epoch = value.neuron;
              $scope.getNameNeuron(value.neuron, $q);
            break;
          }
          $scope.getDiffTS(value.timeline, value.start);

          if( value != null ){
              $resource_uri_splitted = value.resource_uri.split('/');
              $idEpoch = $resource_uri_splitted[3];
              $nCol = value.timeline.split('/');
              $numberCol = $nCol[3];
              $startEpoch = new Date(value.start);
              $startFormat = $startEpoch.format('dd/mm/yyyy - HH:MM');
              if(value.end != null){
                $endEpoch = new Date(value.end);
                $endFormat = $endEpoch.format('dd/mm/yyyy - HH:MM');
                switch($type_epoch){
                  case "electrode":
                    $scope.addElectrode($idEpoch, $numberCol, value.label, $startEpoch, $startFormat, value.type, $scope.diffTSEpoch, $endEpoch, $endFormat, value.model, value.version, value.serial_or_id, value.manufacturer, value.notes, value.impedance, value.internal_diameter, value.rows, value.columns, value.step, 0);
                  break;
                  case "neuron":
                    $scope.addNeuron($idEpoch, $numberCol, value.label, $startEpoch, $startFormat, value.type, $scope.diffTSEpoch, $endEpoch, $endFormat, $link_epoch, value.properties, 0);
                  break;
                  case "protocol":
                    $scope.addProtocol($idEpoch, $numberCol, value.text, $startEpoch, $startFormat, value.type, $scope.diffTSEpoch, $endEpoch, $endFormat, $link_epoch);
                  break;
                }
              } else {
                switch($type_epoch){
                  case "electrode":
                    $scope.addElectrode($idEpoch, $numberCol, value.label, $startEpoch, $startFormat, value.type, $scope.diffTSEpoch, null, null, value.model, value.version, value.serial_or_id, value.manufacturer, value.notes, value.impedance, value.internal_diameter, value.rows, value.columns, value.step, 0);
                  break;
                  case "neuron":
                    $scope.addNeuron($idEpoch, $numberCol, value.label, $startEpoch, $startFormat, value.type, $scope.diffTSEpoch, null, null, $link_epoch, value.properties, 0);
                  break;
                  case "protocol":
                    $scope.addProtocol($idEpoch, $numberCol, value.text, $startEpoch, $startFormat, value.type, $scope.diffTSEpoch, null, null, $link_epoch);
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
        //angular.forEach(data.objects, function($value){
          if(data.id == $routeParams.eID){
            var $dateEnd = new Date();
            data.end = $dateEnd;
          }
        //});
        $scope.jsonContentExp = angular.toJson(data);
        Experiment.put({id:$routeParams.eID}, $scope.jsonContentExp, function(){}).$promise.then(function(val) {
          //$scope.toJSON();
          angular.element(".btnAddEvtEpoch  button").remove();
        });
      });
    };
    $scope.stopSpin = function() {
      if($rootScope.spin == 1){
        setTimeout(function(){ angular.element(window).spin(); }, 3500);
      }
      $rootScope.spin = 0;
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
  $scope.selectYearOpt = ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031'];
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
  '$scope', '$element', 'title', 'electrodeObj', 'DeviceType', 'SupplierService', 'close', 
  function($scope, $element, title, electrodeObj, DeviceType, SupplierService, close) {

  $scope.lstTypeElectrode = DeviceType.get();
  $scope.lstManufacturersElectrode = SupplierService.get();
  $scope.label = null;
  $scope.type = null;
  $scope.model = null;
  $scope.version = null;
  $scope.serial_or_id = null;
  $scope.manufacturer = null;
  $scope.id_notes = null;
  $scope.impedance = null;
  $scope.internal_diameter = null;
  $scope.rows = null;
  $scope.columns = null;
  $scope.step = null;

  $scope.title = title;
  $scope.electrodeObj = electrodeObj;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.beforeClose = function() {
    if($scope.type == ""){$scope.type = null};
    if($scope.label == ""){$scope.label = null};
    if($scope.model == ""){$scope.model = null};
    if($scope.version == ""){$scope.version = null};
    if($scope.impedance == ""){$scope.impedance = null};
    if($scope.internal_diameter == ""){$scope.internal_diameter = null};
    if($scope.rows == ""){$scope.rows = null};
    if($scope.columns == ""){$scope.columns = null};
    if($scope.step == ""){$scope.step = null};

    if($scope.type == null){
      $scope.msgAlert = "Please choose type to create electrode !";
    } else if($scope.label == null) {
      $scope.msgAlert = "Label field is required";
    } else if($scope.model == null) {
      $scope.msgAlert = "Model field is required";
    } else if($scope.version == null) {
      $scope.msgAlert = "Version field is required";
    } else if($scope.manufacturer == null) {
      $scope.msgAlert = "Manufacurer field is required";
    } else if((!$.isNumeric($scope.impedance)) & ($scope.impedance != null)) {
      $scope.msgAlert = "Impedance field must be a number";
    } else if((!$.isNumeric($scope.internal_diameter)) & ($scope.internal_diameter != null)) {
      $scope.msgAlert = "Internal Diameter field must be a number";
    } else if((!$.isNumeric($scope.rows)) & ($scope.rows != null)) {
      $scope.msgAlert = "Rows field must be a number";
    } else if((!$.isNumeric($scope.columns)) & ($scope.columns != null)) {
      $scope.msgAlert = "Columns field must be a number";
    } else if((!$.isNumeric($scope.step)) & ($scope.step != null)) {
      $scope.msgAlert = "Step field must be a number";
    } else {
      $scope.close();
    }
  };

  $scope.close = function() {
    close({
      label: $scope.label,
      type: $scope.type,
      model: $scope.model,
      version: $scope.version,
      serial_or_id: $scope.serial_or_id,
      manufacturer: $scope.manufacturer,
      notes: $scope.notes,
      impedance: $scope.impedance,
      internal_diameter: $scope.internal_diameter,
      rows: $scope.rows,
      columns: $scope.columns,
      step: $scope.step,
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
      model: $scope.model,
      version: $scope.version,
      serial_or_id: $scope.serial_or_id,
      manufacturer: $scope.manufacturer,
      notes: $scope.notes,
      impedance: $scope.impedance,
      internal_diameter: $scope.internal_diameter,
      rows: $scope.rows,
      columns: $scope.columns,
      step: $scope.step,
    }, 100); // close, but give 500ms for bootstrap to animate
  };
}]);

mod_tlv.controller('AddNeuronController', [
  '$scope', '$element', 'title', 'neuronObj', 'electrodeObjList', 'CellType', 'close', 
  function($scope, $element, title, neuronObj, electrodeObjList, CellType, close) {

  $scope.lstTypeNeuron = CellType.get();

  $scope.label = null;
  $scope.type = null;
  $scope.title = title;
  $scope.link_electrode = null;
  $scope.properties = null;
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
    $link_electrode = $scope.link_electrode;
    close({
      label: $scope.label,
      type: $scope.type,
      link_electrode: $link_electrode,
      properties: $scope.properties,
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function() {
    //  Manually hide the modal.
    $element.modal('hide');
    //  Now call close, returning control to the caller.
    $link_electrode = $scope.link_electrode;
    close({
      label: $scope.label,
      type: $scope.type,
      link_electrode: $link_electrode,
      properties: $scope.properties,
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



mod_tlv.controller('EditElectrodeController', [
  '$scope', '$element', 'title', 'electrode_label', 'electrode_type', 'electrode_start', 'electrode_end', 'model', 'version','serial_or_id', 'manufacturer', 'notes', 'impedance', 'internal_diameter','rows','columns','step','electrode_id', 'electrodeObj', 'electrodeObjList', 'DeviceType', 'SupplierService', 'close', 
  function($scope, $element, title, electrode_label, electrode_type, electrode_start, electrode_end, model, version, serial_or_id, manufacturer, notes, impedance, internal_diameter, rows, columns, step, electrode_id, electrodeObj, electrodeObjList, DeviceType, SupplierService, close) {

  $scope.selectDayOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
  $scope.selectMonthOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  $scope.selectYearOpt = ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031'];
  $scope.selectHourOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
  $scope.selectMinOpt = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'];

  $scope.label = electrode_label;
  $scope.electrode_id = electrode_id;
  $d = electrode_start.getDate();
  $scope.start_day = $d > 9 ? "" + $d: "0" + $d;
  $m = electrode_start.getMonth() + 1;
  $scope.start_month = $m > 9 ? "" + $m: "0" + $m;
  $y = electrode_start.getFullYear();
  $scope.start_year = $y > 9 ? "" + $y: "0" + $y;
  $h = electrode_start.getHours();
  $scope.start_hour = $h > 9 ? "" + $h: "0" + $h;
  $min = electrode_start.getMinutes();
  $scope.start_min = $min > 9 ? "" + $min: "0" + $min;

  if(electrode_end != null){
    $d = electrode_end.getDate();
    $scope.end_day = $d > 9 ? "" + $d: "0" + $d;
    $m = electrode_end.getMonth() + 1;
    $scope.end_month = $m > 9 ? "" + $m: "0" + $m;
    $y = electrode_end.getFullYear();
    $scope.end_year = $y > 9 ? "" + $y: "0" + $y;
    $h = electrode_end.getHours();
    $scope.end_hour = $h > 9 ? "" + $h: "0" + $h;
    $min = electrode_end.getMinutes();
    $scope.end_min = $min > 9 ? "" + $min: "0" + $min;
  }
  //$scope.type = electrode_type;
  $scope.type = {resource_uri: electrode_type };
  $scope.title = title;
  $scope.model = model;
  $scope.version = version;
  $scope.serial_or_id = serial_or_id;
  $scope.manufacturer = {resource_uri: manufacturer };
  $scope.notes = notes;
  $scope.impedance = impedance;
  $scope.internal_diameter = internal_diameter;
  $scope.rows = rows;
  $scope.columns = columns;
  $scope.step = step;

  $scope.del_electrode = false;
  $scope.stop_electrode = false;
  $scope.electrodeObj = electrodeObj;
  $scope.electrodeObjList = electrodeObjList;
  $scope.lstTypeObj = [];
  
  $scope.lstType = DeviceType.get();
  $scope.lstManufacturersElectrode = SupplierService.get();
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.

  $scope.beforeClose = function() {
    if($scope.type == ""){$scope.type = null};
    if($scope.label == ""){$scope.label = null};
    if($scope.model == ""){$scope.model = null};
    if($scope.version == ""){$scope.version = null};
    if($scope.impedance == ""){$scope.impedance = null};
    if($scope.internal_diameter == ""){$scope.internal_diameter = null};
    if($scope.rows == ""){$scope.rows = null};
    if($scope.columns == ""){$scope.columns = null};
    if($scope.step == ""){$scope.step = null};

    if($scope.type == null){
      $scope.msgAlert = "Please choose type to create electrode !";
    } else if($scope.label == null) {
      $scope.msgAlert = "Label field is required";
    } else if($scope.model == null) {
      $scope.msgAlert = "Model field is required";
    } else if($scope.version == null) {
      $scope.msgAlert = "Version field is required";
    } else if((!$.isNumeric($scope.impedance)) & ($scope.impedance != null)) {
      $scope.msgAlert = "Impedance field must be a number";
    } else if((!$.isNumeric($scope.internal_diameter)) & ($scope.internal_diameter != null)) {
      $scope.msgAlert = "Internal Diameter field must be a number";
    } else if((!$.isNumeric($scope.rows)) & ($scope.rows != null)) {
      $scope.msgAlert = "Rows field must be a number";
    } else if((!$.isNumeric($scope.columns)) & ($scope.columns != null)) {
      $scope.msgAlert = "Columns field must be a number";
    } else if((!$.isNumeric($scope.step)) & ($scope.step != null)) {
      $scope.msgAlert = "Step field must be a number";
    } else {
      $scope.close();
    }
  };

  $scope.close = function() {
    $scope.getDateData();
    close({
      label: $scope.label,
      electrode_start: $scope.electrode_start,
      electrode_end: $scope.electrode_end,
      type: $scope.type,
      del_electrode: $scope.del_electrode,
      stop_electrode: $scope.stop_electrode,

      model: $scope.model,
      version: $scope.version,
      serial_or_id: $scope.serial_or_id,
      manufacturer: $scope.manufacturer,
      notes: $scope.notes,
      impedance: $scope.impedance,
      internal_diameter: $scope.internal_diameter,
      rows: $scope.rows,
      columns: $scope.columns,
      step: $scope.step,

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
      label: $scope.label,
      electrode_start: $scope.electrode_start,
      electrode_end: $scope.electrode_end,
      type: $scope.type,

      model: $scope.model,
      version: $scope.version,
      serial_or_id: $scope.serial_or_id,
      manufacturer: $scope.manufacturer,
      notes: $scope.notes,
      impedance: $scope.impedance,
      internal_diameter: $scope.internal_diameter,
      rows: $scope.rows,
      columns: $scope.columns,
      step: $scope.step,

    }, 100); // close, but give 500ms for bootstrap to animate
  };

  $scope.getDateData = function() {
    $day = $scope.start_day;
    $month = $scope.start_month;
    $year = $scope.start_year;
    $hour = $scope.start_hour;
    $min = $scope.start_min;
    $scope.electrode_start = $day+"/"+$month+"/"+$year+" "+$hour+":"+$min;

    $day = $scope.end_day;
    $month = $scope.end_month;
    $year = $scope.end_year;
    $hour = $scope.end_hour;
    $min = $scope.end_min;
    if(($day === undefined) | ($month === undefined) | ($year === undefined) | ($hour === undefined) | ($min === undefined)){
      $scope.electrode_end = "";
    } else {
      $scope.electrode_end = $day+"/"+$month+"/"+$year+" "+$hour+":"+$min;
    }
  };

  $scope.delete = function(){
    $scope.del_electrode = true;
    $scope.close();
  };

  $scope.stop = function(){
    $scope.stop_electrode = true;
    $scope.close();
  };

  $scope.displayDatePicker = function($electrode_id, $start_end) {
    if($start_end == "start"){
      angular.element('#datetimepicker_start_'+$electrode_id).datetimepicker({
          locale: 'en-gb'
      });
    } else if ($start_end == "end"){
      angular.element('#datetimepicker_end_'+$electrode_id).datetimepicker({
          locale: 'en-gb'
      });
    }
  };
}]);


mod_tlv.controller('EditNeuronController', [
  '$scope', '$element', 'title', 'neuron_label', 'neuron_type', 'neuron_start', 'neuron_end', 'properties', 'neuron_id', 'neuronObj', 'neuronObjList', 'link_electrode', 'CellType', 'close', 
  function($scope, $element, title, neuron_label, neuron_type, neuron_start, neuron_end, properties, neuron_id, neuronObj, neuronObjList, link_electrode, CellType, close) {

  $scope.selectDayOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
  $scope.selectMonthOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  $scope.selectYearOpt = ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031'];
  $scope.selectHourOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
  $scope.selectMinOpt = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'];

  $scope.label = neuron_label;
  $scope.neuron_id = neuron_id;
  $d = neuron_start.getDate();
  $scope.start_day = $d > 9 ? "" + $d: "0" + $d;
  $m = neuron_start.getMonth() + 1;
  $scope.start_month = $m > 9 ? "" + $m: "0" + $m;
  $y = neuron_start.getFullYear();
  $scope.start_year = $y > 9 ? "" + $y: "0" + $y;
  $h = neuron_start.getHours();
  $scope.start_hour = $h > 9 ? "" + $h: "0" + $h;
  $min = neuron_start.getMinutes();
  $scope.start_min = $min > 9 ? "" + $min: "0" + $min;

  if(neuron_end != null){
    $d = neuron_end.getDate();
    $scope.end_day = $d > 9 ? "" + $d: "0" + $d;
    $m = neuron_end.getMonth() + 1;
    $scope.end_month = $m > 9 ? "" + $m: "0" + $m;
    $y = neuron_end.getFullYear();
    $scope.end_year = $y > 9 ? "" + $y: "0" + $y;
    $h = neuron_end.getHours();
    $scope.end_hour = $h > 9 ? "" + $h: "0" + $h;
    $min = neuron_end.getMinutes();
    $scope.end_min = $min > 9 ? "" + $min: "0" + $min;
  }

  CellType.get(function($data){
    angular.forEach($data.objects, function($value){
      if($value.resource_uri == neuron_type){
        $scope.type = $value.name;
      }
    });
  }); 
  $scope.title = title;
  $scope.properties = properties;
  $scope.del_neuron = false;
  $scope.stop_neuron = false;
  $scope.link_electrode = link_electrode;
  $scope.neuronObj = neuronObj;
  $scope.neuronObjList = neuronObjList;
  $scope.lstTypeObj = [];
  $scope.lstType = CellType.get();
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
    CellType.get(function($data){
      angular.forEach($data.objects, function($value){
        if($value.name == $scope.type){
          $type_uri = $value.resource_uri;
        }
      });

      $scope.getDateData();
      close({
        label: $scope.label,
        neuron_start: $scope.neuron_start,
        neuron_end: $scope.neuron_end,
        type: $type_uri,
        properties: $scope.properties,
        del_neuron: $scope.del_neuron,
        stop_neuron: $scope.stop_neuron,
      }, 100); // close, but give 500ms for bootstrap to animate
    });
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function() {
    //  Manually hide the modal.
    $element.modal('hide');

    CellType.get(function($data){
      angular.forEach($data.objects, function($value){
        if($value.name == $scope.type){
          $type_uri = $value.resource_uri;
        }
      });
      $scope.getDateData();
      //  Now call close, returning control to the caller.
      close({
        label: $scope.label,
        neuron_start: $scope.neuron_start,
        neuron_end: $scope.neuron_end,
        type: $scope.type,
        properties: $scope.properties,
        link_electrode: $link_electrode,
      }, 100); // close, but give 500ms for bootstrap to animate
    });
  };

  $scope.getDateData = function() {
    $day = $scope.start_day;
    $month = $scope.start_month;
    $year = $scope.start_year;
    $hour = $scope.start_hour;
    $min = $scope.start_min;
    $scope.neuron_start = $day+"/"+$month+"/"+$year+" "+$hour+":"+$min;

    $day = $scope.end_day;
    $month = $scope.end_month;
    $year = $scope.end_year;
    $hour = $scope.end_hour;
    $min = $scope.end_min;
    if(($day === undefined) | ($month === undefined) | ($year === undefined) | ($hour === undefined) | ($min === undefined)){
      $scope.neuron_end = "";
    } else {
      $scope.neuron_end = $day+"/"+$month+"/"+$year+" "+$hour+":"+$min;
    }
  };

  $scope.delete = function(){
    $scope.del_neuron = true;
    $scope.close();
  };

  $scope.stop = function(){
    $scope.stop_neuron = true;
    $scope.close();
  };

  $scope.displayDatePicker = function($neuron_id, $start_end) {
    if($start_end == "start"){
      angular.element('#datetimepicker_start_'+$neuron_id).datetimepicker({
          locale: 'en-gb'
      });
    } else if ($start_end == "end"){
      angular.element('#datetimepicker_end_'+$neuron_id).datetimepicker({
          locale: 'en-gb'
      });
    }
  };
}]);


mod_tlv.controller('EditProtocolController', [
  '$scope', '$element', 'title', 'protocol_text', 'protocol_type', 'protocol_start', 'protocol_end', 'protocol_id', 'protocolObj', 'protocolObjList', 'link_neuron', 'close', 
  function($scope, $element, title, protocol_text, protocol_type, protocol_start, protocol_end, protocol_id, protocolObj, protocolObjList, link_neuron, close) {

  $scope.selectDayOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
  $scope.selectMonthOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  $scope.selectYearOpt = ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031'];
  $scope.selectHourOpt = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
  $scope.selectMinOpt = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'];

  $scope.text = protocol_text;
  $scope.protocol_id = protocol_id;
  $d = protocol_start.getDate();
  $scope.start_day = $d > 9 ? "" + $d: "0" + $d;
  $m = protocol_start.getMonth() + 1;
  $scope.start_month = $m > 9 ? "" + $m: "0" + $m;
  $y = protocol_start.getFullYear();
  $scope.start_year = $y > 9 ? "" + $y: "0" + $y;
  $h = protocol_start.getHours();
  $scope.start_hour = $h > 9 ? "" + $h: "0" + $h;
  $min = protocol_start.getMinutes();
  $scope.start_min = $min > 9 ? "" + $min: "0" + $min;

  if(protocol_end != null){
    $d = protocol_end.getDate();
    $scope.end_day = $d > 9 ? "" + $d: "0" + $d;
    $m = protocol_end.getMonth() + 1;
    $scope.end_month = $m > 9 ? "" + $m: "0" + $m;
    $y = protocol_end.getFullYear();
    $scope.end_year = $y > 9 ? "" + $y: "0" + $y;
    $h = protocol_end.getHours();
    $scope.end_hour = $h > 9 ? "" + $h: "0" + $h;
    $min = protocol_end.getMinutes();
    $scope.end_min = $min > 9 ? "" + $min: "0" + $min;
  }
  $scope.type = protocol_type;
  $scope.title = title;
  $scope.del_protocol = false;
  $scope.stop_protocol = false;
  $scope.link_neuron = link_neuron;
  $scope.protocolObj = protocolObj;
  $scope.protocolObjList = protocolObjList;
  $scope.lstTypeObj = [];

  $scope.lstType = ["Type 1", "Type 2", "Type 3", "Type 4", "Type 5"]

  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
    $scope.getDateData();
    close({
      text: $scope.text,
      protocol_start: $scope.protocol_start,
      protocol_end: $scope.protocol_end,
      type: $scope.type,
      del_protocol: $scope.del_protocol,
      stop_protocol: $scope.stop_protocol,
      link_neuron: $scope.link_neuron,
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
      protocol_start: $scope.protocol_start,
      protocol_end: $scope.protocol_end,
      type: $scope.type,
      link_neuron: $scope.link_neuron,
    }, 100); // close, but give 500ms for bootstrap to animate
  };

  $scope.getDateData = function() {
    $day = $scope.start_day;
    $month = $scope.start_month;
    $year = $scope.start_year;
    $hour = $scope.start_hour;
    $min = $scope.start_min;
    $scope.protocol_start = $day+"/"+$month+"/"+$year+" "+$hour+":"+$min;

    $day = $scope.end_day;
    $month = $scope.end_month;
    $year = $scope.end_year;
    $hour = $scope.end_hour;
    $min = $scope.end_min;
    if(($day === undefined) | ($month === undefined) | ($year === undefined) | ($hour === undefined) | ($min === undefined)){
      $scope.protocol_end = "";
    } else {
      $scope.protocol_end = $day+"/"+$month+"/"+$year+" "+$hour+":"+$min;
    }
  };

  $scope.delete = function(){
    $scope.del_protocol = true;
    $scope.close();
  };

  $scope.stop = function(){
    $scope.stop_protocol = true;
    $scope.close();
  };

  $scope.displayDatePicker = function($protocol_id, $start_end) {
    if($start_end == "start"){
      angular.element('#datetimepicker_start_'+$protocol_id).datetimepicker({
          locale: 'en-gb'
      });
    } else if ($start_end == "end"){
      angular.element('#datetimepicker_end_'+$protocol_id).datetimepicker({
          locale: 'en-gb'
      });
    }
  };
}]);