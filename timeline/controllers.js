var mod_tlv = angular.module('mod_tlv', ['ui.bootstrap',
                                         'angularModalService',
                                         'timeLineServices',
                                         'eventServices',
                                         'epochServices',
                                         'hermann.experiments',
                                         'CellTypeService',
                                         'DeviceTypeService',
                                         'SupplierService',
                                         'ngRoute',
                                         ]);

mod_tlv.controller('timeLineVisualController',
function ($scope, $rootScope, $compile, ModalService, $http, $q, timeLine, events, epochs, CellType, DeviceType, $routeParams, Experiment, $route) {
    $scope.$route = $route;

    $scope.idExp = 0;
    $scope.dateStartExp = "";
    $scope.dateEndExp = "";
    $scope.heightMinEpoch = 35;
    $rootScope.spin = 0;

    $scope.margin_bottom_timeline = 150;
    $scope.scale_coef = 60;

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

    //$scope.stopSpin();

    // get the current experiment
    $scope.experiment = Experiment.get(
        {id:$routeParams.eID},
        function(data){
            angular.element(window).spin();
            $rootScope.spin = 1;

            //format of date of end experiment
            $dateEndExp = new Date($scope.experiment.end);
            if($scope.experiment.end != null){
              $scope.dateEndExp = $dateEndExp.format('dd/mm/yyyy - HH:MM');
            }
            //$scope.stopSpin();
            // get timelines for this experiment only
            $scope.TLExp = timeLine.get(
                {experiment__id: $scope.experiment.id},
                function(data){
                    angular.element(window).spin();
                    $rootScope.spin = 1;
                    angular.forEach( $scope.TLExp.objects, function(value, key) {
                        $scope.TLExp.objects[key].height = $scope.margin_bottom_timeline;
                        $scope.TLExp.objects[key].key = key;
                        // get dependency keys
                        angular.forEach( $scope.depend_choices, function(dep, k) {
                            if( dep.timeline == value.name ){
                                $scope.depend_choices[k].timeline_key = key;
                            };
                        });

                        // get events
                        $scope.TLExp.objects[key].events = events.get(
                            {timeline__id: $scope.TLExp.objects[key].id},
                            function(data){
                                angular.element(window).spin();
                                $rootScope.spin = 1;
                                angular.forEach( $scope.TLExp.objects[key].events.objects, function(value2, key2) {
                                    angular.element(".resetstarthour").remove();
                                    //calculation of event placement on timeline
                                    timeStampStartExp = $scope.experiment.start.valueOf();
                                    timeStampEvt = $scope.TLExp.objects[key].events.objects[key2].date.valueOf();
                                    $scope.TLExp.objects[key].events.objects[key2].vPlacement = ((new Date(timeStampEvt)/1e3|0) - (new Date(timeStampStartExp)/1e3|0)) / $scope.scale_coef;
                                    // check whether event placement is higher than current value
                                    if( $scope.TLExp.objects[key].events.objects[key2].vPlacement > $scope.TLExp.objects[key].height){
                                        $scope.TLExp.objects[key].height = $scope.TLExp.objects[key].events.objects[key2].vPlacement + $scope.margin_bottom_timeline;
                                        //$scope.TLExp.objects[key].height = $( document ).height();
                                    }
                                });
                            }
                        );

                        // get epochs
                        $scope.TLExp.objects[key].epochs = epochs.get(
                            {timeline__id: $scope.TLExp.objects[key].id},
                            function(data){
                                angular.element(window).spin();
                                $rootScope.spin = 1;
                                angular.forEach( $scope.TLExp.objects[key].epochs.objects, function(value2, key2) {
                                    angular.element(".resetstarthour").remove();
                                    //calculation of event placement on timeline
                                    timeStampStartExp = $scope.experiment.start.valueOf();
                                    timeStampEpoch = $scope.TLExp.objects[key].epochs.objects[key2].start.valueOf();

                                    $scope.TLExp.objects[key].epochs.objects[key2].vPlacement = ((new Date(timeStampEpoch)/1e3|0) - (new Date(timeStampStartExp)/1e3|0)) / $scope.scale_coef;

                                    if($scope.TLExp.objects[key].epochs.objects[key2].end != null){
                                        timeStampEpochEnd = $scope.TLExp.objects[key].epochs.objects[key2].end.valueOf();
                                        $scope.TLExp.objects[key].epochs.objects[key2].epoch_height = ((new Date(timeStampEpochEnd)/1e3|0) - (new Date(timeStampEpoch)/1e3|0)) / $scope.scale_coef;
                                    } else {
                                        $scope.TLExp.objects[key].epochs.objects[key2].epoch_height = 35;
                                    }

                                    // check whether event placement is higher than current value
                                    if( $scope.TLExp.objects[key].epochs.objects[key2].vPlacement > $scope.TLExp.objects[key].height){
                                        $scope.TLExp.objects[key].height = $scope.TLExp.objects[key].epochs.objects[key2].vPlacement + $scope.margin_bottom_timeline;
                                        //$scope.TLExp.objects[key].height = $( document ).height();
                                    }
                                });
                            }
                        );
                    });
                }
            );
            //chronometer
            var currentDate = new Date();
            var pastDate  = new Date($scope.experiment.start);
            var diff = currentDate.getTime() / 1000 - pastDate.getTime() / 1000;
            var clock = $('.clock').FlipClock(diff, {
                clockFace: 'DailyCounter',
                countdown: false
            });
            //end of chronometer
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
                dateFormat : dateEvent.format('yyyy/mm/dd HH:MM'),
                type : $scope.config_defaults[$scope.experiment.type][timeline.name]['event'],
                color : "#FFFFFF",
                vPlacement : (((new Date(dateEvent)/1e3|0) - (new Date(dateStartExp)/1e3|0)) / $scope.scale_coef),
            };
            // template add
            edition = false;
        } else {
            // EDIT
            edition = true;
        }

        ModalService.showModal({
            templateUrl: "timeline/modal_dlg_event.tpl.html",
            controller: "ManageEventController",
            inputs: {
                title: "Event information",
                config_defaults: $scope.config_defaults,
                config_choices: $scope.config_choices,
                timeline_name: timeline.name,
                edition: edition,
                event: event,
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then( function(result) {
                if(result.del_evt == true){
                    $scope.showConfirmRemoveEvent(result.event);
                } else{
                    $scope.manageEvent( timeline, result.event, edition );
                }
            });
        });
    };

    //create event: display it in the timaline and insert it in the database
    $scope.manageEvent = function( timeline, event, edition ){
        angular.element(window).spin();
        //hide reset start hour of experiment
        angular.element(".resetstarthour").remove();
        $rootScope.spin = 1;

        // if event.id is null: POST
        if(edition == false){
            events.post(event, function(data){
                $scope.TLExp.objects[timeline.key].events.objects.push(event);
                $scope.TLExp.objects[timeline.key].height = event.vPlacement + $scope.margin_bottom_timeline;
                $scope.stopSpin();
            });
        } else {
            event.vPlacement = (((new Date(event.date.valueOf())/1e3|0) - (new Date($scope.experiment.start.valueOf())/1e3|0)) / $scope.scale_coef);
            events.put({id:event.id}, angular.toJson(event), function(){
                $scope.stopSpin();
            });
        }
    };

    $scope.showConfirmRemoveEvent = function(event) {
        ModalService.showModal({
            templateUrl: 'timeline/modal_confirm_remove_event.tpl.html',
            controller: "ModalController"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result=="Yes") {
                    $scope.removeEvent(event);
                }
            });
        });
    };

    $scope.removeEvent = function(event){
        angular.element('#event_' + event.id).remove();
        events.del({id:event.id});
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
                dateFormat : dateStartEpoch.format('dd/mm/yyyy HH:MM'),
                end : null,
                type : $scope.config_defaults[$scope.experiment.type][timeline.name]['epoch'],
                text : "",
                color : "#FFF600",
                vPlacement : (((new Date(dateStartEpoch)/1e3|0) - (new Date(dateStartExp)/1e3|0)) / $scope.scale_coef),
                depend : null,
            }
            edition = false;
        } else {
            // EDIT
            edition = true;
        }

        // set dependencies
        //console.log(timeline.name +" "+timeline.id)
        if( $scope.depend_choices[timeline.name] != undefined ){
            //console.log( "my parent is: "+$scope.TLExp.objects[ $scope.depend_choices[timeline.name].timeline_key ].name )
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
            templateUrl: "timeline/modal_dlg_epoch.tpl.html",
            controller: "ManageEpochController",
            inputs: {
                title: "Epoch information",
                depend_choices: $scope.depend_choices,
                config_choices: $scope.config_choices,
                timeline_name: timeline.name,
                edition: edition,
                epoch: epoch,
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if(result.del_epoch == true){
                    $scope.showConfirmRemoveEpoch(result.epoch);
                } else {
                    $scope.manageEpoch( timeline, result.epoch, edition );
                }
            });
        });
    };

    //create epoch: display it in the timaline and insert it in the database
    $scope.manageEpoch = function(timeline, epoch, edition){
        angular.element(window).spin();
        angular.element(".resetstarthour").remove();
        $rootScope.spin = 1;
        if(edition == false){
            epochs.post(epoch, function(data){
                //console.log(data);
                epoch.id = data.id;
                $scope.TLExp.objects[timeline.key].epochs.objects.push(epoch);
                $scope.TLExp.objects[timeline.key].height = epoch.vPlacement + $scope.margin_bottom_timeline;
                $scope.stopSpin();
            });
        } else {
            epochs.put({id:epoch.id}, angular.toJson(epoch), function(){
                if(epoch.end != null){
                    epoch.epoch_height = ((new Date(epoch.end)/1e3|0) - (new Date(epoch.start)/1e3|0)) / $scope.scale_coef;
                }
                $scope.stopSpin();
            });
        }
    };

    $scope.showConfirmRemoveEpoch = function(epoch) {
        ModalService.showModal({
            templateUrl: 'timeline/modal_confirm_remove_epoch.tpl.html',
            controller: "ModalController"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result=="Yes") {
                    $scope.removeEpoch(epoch);
                }
            });
        });
    };

    $scope.removeEpoch = function(epoch){
        angular.element('#epoch_' + epoch.id).remove();
        epochs.del({id:epoch.id});
    };

    $scope.displayZoomEvent = function(scale_coef){
        $scope.scale_coef = scale_coef;
        $scope.$route.reload();
    };

    $scope.stopExperiment = function() {
        //alert("tttt");
        bootbox.confirm( "Do you really want to stop this experiment ?",
                         function(result){
                           if(result == true){
                             $scope.experiment.end = new Date();
                             $scope.jsonContentExp = angular.toJson($scope.experiment);
                             Experiment.put({id:$scope.experiment.id}, $scope.jsonContentExp, function(){
                                 angular.element(".btnAddEvtEpoch button").remove();
                                 angular.element(".glyphicon-stop").remove();
                                 angular.element(".resetstarthour").remove();
                             });
                           }
                         }
                       );
    };

    $scope.showConfirmResetStartHour = function() {
        ModalService.showModal({
            templateUrl: 'timeline/modal_confirm_reset_start.tpl.html',
            controller: "ModalController"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result=="Yes") {
                    $scope.resetStartHour();
                }
            });
        });
    };

    $scope.resetStartHour = function() {
        $scope.experiment.start = new Date();
        $scope.jsonContentExp = angular.toJson($scope.experiment);
        Experiment.put({id:$scope.experiment.id}, $scope.jsonContentExp, function(){});
        //renitialisation of the timer
        var clock = $('.clock').FlipClock({
            clockFace: 'DailyCounter',
            countdown: false
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

mod_tlv.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    var global_height = $(document).height() - ($(".navbar-fixed-top").height() + $("#fixed_bar").height());
                    angular.element("#graduation").remove();
                    angular.element(".timeline-column").height(global_height);
                });
            }
        }
    }
});


mod_tlv.controller('ManageEventController', [
    '$scope', '$element', 'title', 'close', 'config_choices', 'timeline_name', 'edition', 'event',
    function($scope, $element, title, close, config_choices, timeline_name, edition, event) {

    $scope.event = event;
    $scope.event.date = new Date(event.date).format("yyyy/mm/dd HH:MM");
    $scope.title = title;
    $scope.list_selection = config_choices[timeline_name];
    $scope.edition = edition;
    $scope.del_evt = false;

    $scope.beforeClose = function() {
        //console.log($scope.dateFormat);
        event.date = new Date($scope.event.date);
        if($scope.event.text == ""){
            $scope.msgAlert = "Text field is required";
        } else {
            $scope.close();
        }
    };

    $scope.delete = function(){
        $scope.del_evt = true;
        $scope.close();
    };

    $scope.close = function() {
        close({
            event: $scope.event,
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
            event: $scope.event,
        }, 100); // close, but give 500ms for bootstrap to animate
    };
}]);

mod_tlv.controller('ManageEpochController', [
    '$scope', '$element', 'title', 'close', 'depend_choices', 'config_choices', 'timeline_name', 'edition', 'epoch',
    function($scope, $element, title, close, depend_choices, config_choices, timeline_name, edition, epoch) {

    $scope.epoch = epoch;
    $scope.title = title;
    $scope.list_selection = config_choices[timeline_name];
    $scope.depend_selection = depend_choices[timeline_name];
    $scope.edition = edition;
    $scope.del_epoch = false;

    $scope.beforeClose = function() {
        if($scope.epoch.text == ""){
            $scope.msgAlert = "Text field is required";
        } else if(($scope.epoch.depend == null) && ((timeline_name == "6 Neuron") || (timeline_name == "7 Protocol"))) {
            $scope.msgAlert = "Parent field is required";
        } else {
            $scope.close();
        }
    };

    $scope.delete = function(){
        $scope.del_epoch = true;
        $scope.close();
    };

    $scope.close = function() {
        close({
            epoch: $scope.epoch,
            del_epoch: $scope.del_epoch,
        }, 100); // close, but give 500ms for bootstrap to animate
    };

    $scope.stop = function(){
      bootbox.confirm( "Do you really want to stop this epoch ?",
        function(result){
          if(result == true){
            $scope.epoch.end = new Date();
            $scope.close();
          }
        }
      );
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

mod_tlv.controller('ModalController', function($scope, close) {
  $scope.close = function(result) {
    close(result, 100); // close, but give 500ms for bootstrap to animate
  };
});
