'use strict';

var protocolServices = angular.module('protocolServices', ['ngResource']);

protocolServices.factory('protocol', ['$resource',
  function($resource){
    //return $resource( base_url + 'notebooks/protocol/:id', {id:'@eId'}, {
    return $resource( base_url + 'notebooks/epoch/?timeline__name', {timeline__name:"7 Protocol"}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
      del: { method: 'DELETE', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);



