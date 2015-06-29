
var mod_tlv = angular.module('mod_tlv', ['ui.bootstrap', 
                                         'angularModalService', 
                                         'timeLineServices', 
                                         'eventServices',
                                         'epochServices',
                                         'electrodeServices',
                                         'neuronServices',
                                         'protocolServices',
                                         'hermann.experiments',
                                         ]);
mod_tlv.controller('timeLineVisualController', 
function ($scope, $rootScope, $compile, ModalService, $http, $q, timeLine, events, epoch, electrode, neuron, protocol, $routeParams, Experiment) {
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
    $scope.heightMinEpoch = 35;

    $scope.experiment = Experiment.get({id: $routeParams.eID}, function(data){
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
        angular.forEach($data.objects, function($value){
          $strTL = ($data.objects[$i].timeline).split("/");
          $expEl = $scope.getExpFromTimeline($strTL[3]);
          if($exp == $expEl){
            $scope.tabEl[$i] = $value;
            $startF = new Date($value.start);
            $scope.tabEl[$i].startFormat = $startF.format('dd/mm/yyyy - HH:MM');;
            $i++;
          }
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
            $scope.createNeuron($numberCol, result.text, result.type);
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
        angular.forEach($data.objects, function($value){
          $strTL = ($data.objects[$i].timeline).split("/");
          $expNeur = $scope.getExpFromTimeline($strTL[3]);
          if($exp == $expNeur){
            $scope.tabNeur[$i] = $value;
            $startF = new Date($value.start);
            $scope.tabNeur[$i].startFormat = $startF.format('dd/mm/yyyy - HH:MM');;
            $i++;
          }
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
            $scope.createProtocol($numberCol, result.text, result.type);
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

    $scope.showDlgEditElectrode = function(){

    };

    $scope.showDlgEditNeuron = function(){

    };

    $scope.showDlgEditProtocol = function(){

    };

    $scope.editElectrode = function($id, $text, $start, $end, $type){

    };

    $scope.editNeuron = function($id, $text, $start, $end, $type){

    };

    $scope.editProtocol = function($id, $text, $start, $end, $type){

    };

    $scope.createElectrode = function($numberCol, $text, $type){
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

    $scope.createNeuron = function($numberCol, $text, $type, $link_epoch){

    };

    $scope.createProtocol = function($numberCol, $text, $type, $link_epoch){

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

    $scope.addElectrode = function($numberCol, $text, $startElectrode, $startFormat, $type, $vPlacement, $scl_coef, $endElectrode, $endFormat, $resource_uri){
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
        if($diffTSElectrode < ($scope.heightMinElectrode+1)){
          $diffTSElectrode = $scope.heightMinElectrode;
        }
      } else {
        $diffTSElectrode = $scope.heightMinElectrode;
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
            epoch_height : $diffTSEpoch,
            resource_uri : $resource_uri,
        }
      );
    };

    $scope.addNeuron = function($numberCol, $text, $startEpoch, $startFormat, $type, $vPlacement, $scl_coef, $endEpoch, $endFormat, $link_epoch, $type_epoch, $resource_uri){
      
    };

    $scope.addProtocol = function($numberCol, $text, $startEpoch, $startFormat, $type, $vPlacement, $scl_coef, $endEpoch, $endFormat, $link_epoch, $type_epoch, $resource_uri){
      
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
          if(($value.id == $nbEpoch)){
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
              $startFormat = $startEpoch.format('dd/mm/yyyy - HH:MM');
              if(value.end != null){
                $endEpoch = new Date(value.end);
                $endFormat = $endEpoch.format('dd/mm/yyyy - HH:MM');
                //$scope.addEpoch($numberCol, value.text, $startEpoch, $startFormat, value.type, $diffTSEpoch, $scl_coef, $endEpoch, $endFormat, $link_epoch, $type_epoch, value.resource_uri);
              } else {
                //$scope.addEpoch($numberCol, value.text, $startEpoch, $startFormat, value.type, $diffTSEpoch, $scl_coef, null, null, $link_epoch, $type_epoch, value.resource_uri);
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
  '$scope', '$element', 'title', 'electrodeObj', 'close', 
  function($scope, $element, title, electrodeObj, close) {

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
  '$scope', '$element', 'title', 'neuronObj', 'electrodeObjList', 'close', 
  function($scope, $element, title, neuronObj, electrodeObjList, close) {

  $scope.text = null;
  $scope.type = null;
  $scope.title = title;
  $scope.link_electrode = null;
  $scope.neuronObj = neuronObj;
  $scope.electrodeObjList = electrodeObjList;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.beforeClose = function() {
    $link_electrode = angular.element('#link_electrode').val();
    if($scope.type == null){
      $scope.msgAlert = "Please choose type to create neuron !";
    } else if($link_electrode == "null"){
      $scope.msgAlert = "A neuron must be linked to an electrode";
    } else {
      $scope.close();
    }
  };

  $scope.close = function() {
    $link_electrode = angular.element('#link_electrode').val();
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
    $link_electrode = angular.element('#link_electrode').val();
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
    $link_epoch = angular.element('#link_epoch').val();
    if($scope.type == null){
      $scope.msgAlert = "Please choose type to create protocol !";
    } else if($link_epoch == "null"){
      $scope.msgAlert = "A protocol must be linked to a neuron";
    } else {
      $scope.close();
    }
  };

  $scope.close = function() {
    $link_neuron = angular.element('#link_neuron').val();
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
    $link_neuron = angular.element('#link_neuron').val();
    close({
      text: $scope.text,
      type: $scope.type,
      link_neuron: $link_neuron,
    }, 100); // close, but give 500ms for bootstrap to animate
  };
}]);

