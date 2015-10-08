'use strict';


var electrodeServices = angular.module('electrodeServices', ['ngResource']);

electrodeServices.factory('electrode', ['$resource',
  function($resource){
    return $resource( base_url + 'notebooks/electrode/:id', {id:'@eId'}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
      del: { method: 'DELETE', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);

var DeviceTypeService = angular.module('DeviceTypeService', ['ngResource']);

DeviceTypeService.factory('DeviceType', ['$resource',
  function($resource){
    return $resource( base_url + 'devices/type/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false}
    });
  }]);

var SupplierService = angular.module('SupplierService', ['ngResource']);

SupplierService.factory('SupplierService', ['$resource',
  function($resource){
    return $resource( base_url + 'people/supplier/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false}
    });
  }]);