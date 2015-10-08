'use strict';

var neuronServices = angular.module('neuronServices', ['ngResource']);

neuronServices.factory('neuron', ['$resource',
  function($resource){
    return $resource( base_url + 'notebooks/neuron/:id', {id:'@eId'}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
      del: { method: 'DELETE', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);


var CellTypeService = angular.module('CellTypeService', ['ngResource']);

CellTypeService.factory('CellType', ['$resource',
  function($resource){
    return $resource( base_url + 'neuralstructures/celltype/:id', {id:'@eId'}, {
      get: {method:'GET', params:{format:'json'}, isArray:false}
    });
  }]);
