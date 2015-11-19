'use strict';


var electrodeServices = angular.module('electrodeServices', ['ngResource']);

electrodeServices.factory('electrode', ['$resource',
  function($resource){
    //return $resource( base_url + 'notebooks/electrode/:id', {id:'@eId'}, {
      return $resource( base_url + 'notebooks/epoch/?timeline__name', {timeline__name:"5 Electrode"}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
      del: { method: 'DELETE', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);

var timeLineServices = angular.module('timeLineServices', ['ngResource']);

timeLineServices.factory('timeLine', ['$resource',
  function($resource){
    return $resource( base_url + 'notebooks/timeline/:id', {id:'@eId'}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);
