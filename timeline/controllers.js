var mod_tlv = angular.module('mod_tlv', ['ui.bootstrap', 
                                         'angularModalService', 
                                         'timeLineServices', 
                                         'eventServices',
                                         'epochServices',
                                         'hermann.experiments',
                                         'CellTypeService',
                                         'DeviceTypeService',
                                         'SupplierService'
                                         ]);

mod_tlv.controller('timeLineVisualController', 
function ($scope, $rootScope, $compile, ModalService, $http, $q, timeLine, events, epochs, CellType, DeviceType, $routeParams, Experiment) {

    $scope.idExp = 0;
    $scope.dateStartExp = "";
    $scope.dateEndExp = "";
    $scope.heightMinEpoch = 35;
    $rootScope.spin = 0;

    $scope.margin_bottom_timeline = 150;
    $scope.scale_coef = 60;

    $scope.TLExp_id = [];

    $scope.config_defaults = {
        'CAT VISUAL INVIVO INTRA': {
            '1 Anesthetic': {
                'event': 'Alphaxan',
                'epoch': 'Alphaxan'
            },
            '2 Paralytic': {
                'event': 'Rocuronium',
                'epoch': 'Rocuronium'
            },
            '3 Physiologic': {
                'event': 'LRS+G5%',
                'epoch': 'LRS+G5%'
            },
            '4 Environment': {
                'event': 'Generic',
                'epoch': 'Generic'
            },
            '5 Electrode': {
                'event': 'Generic',
                'epoch': 'Generic'
            },
            '6 Neuron': {
                'event': 'Generic',
                'epoch': 'Generic'
            },
            '7 Protocol': {
                'event': 'Generic',
                'epoch': 'Generic'
            }
        },
        'CAT VISUAL INVIVO EXTRA': {
            '1 Anesthetic': {
                'event': 'Alphaxan',
                'epoch': 'Isoflurane'
            },
            '2 Paralytic': {
                'event': 'Rocuronium',
                'epoch': 'Rocuronium'
            },
            '3 Physiologic': {
                'event': 'LRS+G5%',
                'epoch': 'LRS+G5%'
            },
            '4 Environment': {
                'event': 'Generic',
                'epoch': 'Generic'
            },
            '5 Electrode': {
                'event': 'Generic',
                'epoch': 'Generic'
            },
            '6 Neuron': {
                'event': 'Generic',
                'epoch': 'Generic'
            },
            '7 Protocol': {
                'event': 'Generic',
                'epoch': 'Generic'
            }
        },
        'CAT VISUAL VSD': {
            '1 Anesthetic': {
                'event': 'Alphaxan',
                'epoch': 'Isoflurane'
            },
            '2 Paralytic': {
                'event': 'Rocuronium',
                'epoch': 'Rocuronium'
            },
            '3 Physiologic': {
                'event': 'LRS+G5%',
                'epoch': 'LRS+G5%'
            },
            '4 Environment': {
                'event': 'Generic',
                'epoch': 'Generic'
            },
            '5 Electrode': {
                'event': 'Generic',
                'epoch': 'Generic'
            },
            '6 Neuron': {
                'event': 'Generic',
                'epoch': 'Generic'
            },
            '7 Protocol': {
                'event': 'Generic',
                'epoch': 'Generic'
            },
        },
    };

    $scope.config_choices = {
        '1 Anesthetic': [
            'Generic',
            'Alphaxan',
            'Propofol',
            'Isoflurane',
        ],
        '2 Paralytic': [
            'Generic',
            'Rocuronium',
            'Pancuronium',
            'Vecuronium',
            'Cisatracurium',
        ],
        '3 Physiologic': [
            'Generic',
            'NaCP',
            'LRS',
            'G5%',
            'LRS+G5%',
        ],
        '4 Environment': [
            'Generic'
        ],
        '5 Electrode': [
            'Generic'
        ],
        '6 Neuron': [
            'Generic'
        ],
        '7 Protocol': [
            'Generic'
        ],
    };

    $scope.depend_choices = {
        '6 Neuron': {
            timeline: '5 Electrode',
            timeline_key: null,
            option_epochs: []
        },
        '7 Protocol': {
            timeline: '6 Neuron',
            timeline_key: null,
            option_epochs: [] // {text:<parent.epoch.text>,resource_uri:<parent.epoch.uri>,closed}, {}
        },
    }


    $scope.stopSpin = function() {
      if($rootScope.spin == 1){
        setTimeout(function(){ angular.element(window).spin(); }, 3500);
      }
      $rootScope.spin = 0;
    };


    // get the current experiment
    $scope.experiment = Experiment.get(
        {id:$routeParams.eID},
        function(data){
            // get timelines for this experiment only
            $scope.TLExp = timeLine.get(
                {experiment__id: $scope.experiment.id}, 
                function(data){
                    angular.forEach( $scope.TLExp.objects, function(value, key) {
                        $scope.TLExp_id[key] = $scope.TLExp.objects[key].id;
                        $scope.TLExp.objects[key].height = $scope.margin_bottom_timeline;
                        $scope.TLExp.objects[key].key = key;
                        // get dependency keys
                        angular.forEach( $scope.depend_choices, function(dep, k) {
                            if( dep.timeline == value.name ){
                                console.log("depend choice: "+k);
                                console.log("depend obj: "+dep);
                                console.log("parent key:"+key);
                                $scope.depend_choices[k].timeline_key = key;
                            };
                        });

                        // get events
                        $scope.TLExp.objects[key].events = events.get(
                            {timeline__id: $scope.TLExp.objects[key].id}, 
                            function(data){
                                angular.forEach( $scope.TLExp.objects[key].events.objects, function(value2, key2) {
                                    //calculation of event placement on timeline
                                    timeStampStartExp = $scope.experiment.start.valueOf();
                                    timeStampEvt = $scope.TLExp.objects[key].events.objects[key2].date.valueOf();
                                    $scope.TLExp.objects[key].events.objects[key2].vPlacement = ((new Date(timeStampEvt)/1e3|0) - (new Date(timeStampStartExp)/1e3|0)) / $scope.scale_coef;
                                    // check whether event placement is higher than current value
                                    if( $scope.TLExp.objects[key].events.objects[key2].vPlacement > $scope.TLExp.objects[key].height){
                                        $scope.TLExp.objects[key].height = $scope.TLExp.objects[key].events.objects[key2].vPlacement + $scope.margin_bottom_timeline;
                                    }
                                });
                            }
                        );

                        // get epochs
                        $scope.TLExp.objects[key].epochs = epochs.get(
                            {timeline__id: $scope.TLExp.objects[key].id},
                            function(data){
                                angular.forEach( $scope.TLExp.objects[key].epochs.objects, function(value2, key2) {
                                    //calculation of event placement on timeline
                                    timeStampStartExp = $scope.experiment.start.valueOf();
                                    timeStampEpoch = $scope.TLExp.objects[key].epochs.objects[key2].start.valueOf();
                                    $scope.TLExp.objects[key].epochs.objects[key2].vPlacement = ((new Date(timeStampEpoch)/1e3|0) - (new Date(timeStampStartExp)/1e3|0)) / $scope.scale_coef;
                                    // check whether event placement is higher than current value
                                    if( $scope.TLExp.objects[key].epochs.objects[key2].vPlacement > $scope.TLExp.objects[key].height){
                                        $scope.TLExp.objects[key].height = $scope.TLExp.objects[key].epochs.objects[key2].vPlacement + $scope.margin_bottom_timeline;
                                    }
                                });
                            }
                        );
                    });
                }
            );
        }
    );

    //show dialog add event
    $scope.showDlgEvent = function( timeline, event ){
        // if we are creating an event, we initialize it here
        if( event == null ){
            // ADD
            dateStartExp = $scope.experiment.start.valueOf();
            dateEvent = new Date();
            event = {
                id : null,
                timeline : "/notebooks/timeline/" + timeline.id,
                text : "",
                date : dateEvent,
                dateFormat : dateEvent.format('dd/mm/yyyy - HH:MM'),
                type : $scope.config_defaults[$scope.experiment.type][timeline.name]['event'],
                color : "#FFFFFF",
                vPlacement : (((new Date(dateEvent)/1e3|0) - (new Date(dateStartExp)/1e3|0)) / $scope.scale_coef),
            };
            template_url = "timeline/modal_dlg_add_event.tpl.html";
            // template add
        } else {
            //EDIT
            template_url = "timeline/modal_dlg_edit_event.tpl.html";
        }

        ModalService.showModal({
            templateUrl: template_url,
            controller: "ManageEventController",
            inputs: {
                title: "Event information",
                config_defaults: $scope.config_defaults,
                config_choices: $scope.config_choices,
                timeline_name: timeline.name,
                event: event,
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then( function(result) {
                $scope.manageEvent( timeline, result.event );
            });
        });
    };


    //create event: display it in the timaline and insert it in the database
    $scope.manageEvent = function( timeline, event ){
        angular.element(window).spin();
        $rootScope.spin = 1;

        // if event.id is null: POST
        events.post(event, function(data){
            $scope.TLExp.objects[timeline.key].events.objects.push(event);
            $scope.TLExp.objects[timeline.key].height = event.vPlacement + $scope.margin_bottom_timeline;
            $scope.stopSpin();
        });
        // if event.id is not null: PUT
    };


    //show dialog add epoch
    $scope.showDlgEpoch = function(timeline, epoch){
        // check new epoch
        if( epoch == null ){
            // ADD
            dateStartExp = $scope.experiment.start.valueOf();
            dateStartEpoch = new Date();
            epoch = {
                id : null,
                timeline : "/notebooks/timeline/" + timeline.id,
                start : dateStartEpoch,
                dateFormat : dateStartEpoch.format('dd/mm/yyyy - HH:MM'),
                end : null,
                type : $scope.config_defaults[$scope.experiment.type][timeline.name]['epoch'],
                text : "",
                color : "#FFF600",//
                vPlacement : (((new Date(dateStartEpoch)/1e3|0) - (new Date(dateStartExp)/1e3|0)) / $scope.scale_coef),
                depend : null,
            }
            template_url = "timeline/modal_dlg_add_epoch.tpl.html";
        } else {
            // EDIT
            template_url = "timeline/modal_dlg_edit_epoch.tpl.html";
        }

        // set dependencies
        console.log(timeline.name +" "+timeline.id)
        if( $scope.depend_choices[timeline.name] != undefined ){
            console.log( "my parent is: "+$scope.TLExp.objects[ $scope.depend_choices[timeline.name].timeline_key ].name )
            //console.log( $scope.TLExp.objects.indexOf( $scope.depend_choices[timeline.name].timeline ) )
            // get all epochs in parent timeline
            $scope.depend_choices[timeline.name].option_epochs = [];
            angular.forEach( $scope.TLExp.objects[ $scope.depend_choices[timeline.name].timeline_key ].epochs.objects, 
                function(epc, k) {
                    opt = {
                        text: epc.text,
                        resource_uri: "/notebooks/epoch/"+epc.id,
                        closed: epc.end==null ? false : true // if the epoch end date is null, it is an open epoch
                    }
                    $scope.depend_choices[timeline.name].option_epochs.push(opt)
                }
            );
        }

        ModalService.showModal({
            templateUrl: template_url,
            controller: "ManageEpochController",
            inputs: {
                title: "Epoch information",
                depend_choices: $scope.depend_choices,
                config_choices: $scope.config_choices,
                timeline_name: timeline.name,
                epoch: epoch,
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                $scope.manageEpoch( timeline, result.epoch );
            });
        });
    };

    //create epoch: display it in the timaline and insert it in the database
    $scope.manageEpoch = function(timeline, epoch){
        angular.element(window).spin();
        $rootScope.spin = 1;
        TLExp_key = $scope.TLExp_id.indexOf(timeline.id);
        epochs.post(epoch, function(data){
            console.log(data);
            epoch.id = data.id;
            $scope.TLExp.objects[TLExp_key].epochs.objects.push(epoch);
            $scope.TLExp.objects[TLExp_key].height = epoch.vPlacement + $scope.margin_bottom_timeline;
            $scope.stopSpin();
        });
    };
});

mod_tlv.directive('timeLineDir', function(){
  return {
    replace: false,
    templateUrl: 'timeline/timeline.tpl.html'
  };
});

mod_tlv.directive('eventDir', function(){
  return {
    replace: false,
    templateUrl: 'timeline/event.tpl.html'
  };
});

mod_tlv.directive('epochDir', function(){
  return {
    replace: false,
    templateUrl: 'timeline/epoch.tpl.html'
  };
});

mod_tlv.controller('ManageEventController', [
    '$scope', '$element', 'title', 'close', 'config_choices', 'timeline_name', 'event',
    function($scope, $element, title, close, config_choices, timeline_name, event) {

    $scope.event = event;
    $scope.title = title;
    $scope.list_selection = config_choices[timeline_name];

    $scope.beforeClose = function() {
        $scope.close();
    };

    $scope.close = function() {
        close({
            event: $scope.event,
        }, 100); // close, but give 500ms for bootstrap to animate
    };

    //  This cancel function must use the bootstrap, 'modal' function because
    //  the doesn't have the 'data-dismiss' attribute.
    $scope.cancel = function() {
        //  Manually hide the modal.
        $element.modal('hide');
        //  Now call close, returning control to the caller.
        close({
            event: $scope.event,
        }, 100); // close, but give 500ms for bootstrap to animate
    };
}]);

mod_tlv.controller('ManageEpochController', [
    '$scope', '$element', 'title', 'close', 'depend_choices', 'config_choices', 'timeline_name', 'epoch',
    function($scope, $element, title, close, depend_choices, config_choices, timeline_name, epoch) {

    $scope.epoch = epoch;
    $scope.title = title;
    $scope.list_selection = config_choices[timeline_name];
    $scope.depend_selection = depend_choices[timeline_name];

    $scope.beforeClose = function() {
        $scope.close();
    };

    $scope.close = function() {
        close({
            epoch: $scope.epoch,
        }, 100); // close, but give 500ms for bootstrap to animate
    };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
    $scope.cancel = function() {
    //  Manually hide the modal.
    $element.modal('hide');
    //  Now call close, returning control to the caller.
        close({
            epoch: $scope.epoch,
        }, 100); // close, but give 500ms for bootstrap to animate
    };
}]);
