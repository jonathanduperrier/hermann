'use strict';

var blockServices = angular.module('blockServices', ['ngResource']);

blockServices.factory('blocks', ['$resource',
  function($resource){
    return $resource( base_url + 'recordings/block/:id', {id:'@eId'}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
      del: { method: 'DELETE', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);

blockServices.factory('Experiment',
  function($resource){
    return $resource( base_url + 'experiment/:id', { id:'@eId' },
    {
      get: { method: 'GET', params:{ format:'json' }, isArray: false },
      save: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
      put: { method:'PUT', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
      patch:  { method:'PATCH', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
      del: { method: 'DELETE', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
    });
  }
);
