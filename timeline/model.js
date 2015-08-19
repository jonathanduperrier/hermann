var timeLineServices = angular.module('timeLineServices', ['ngResource']);

timeLineServices.factory('timeLine', ['$resource',
  function($resource){
    return $resource( base_url + 'notebooks/timeline/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);

var eventServices = angular.module('eventServices', ['ngResource']);

eventServices.factory('events', ['$resource',
  function($resource){
    return $resource( base_url + 'notebooks/event/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);

var electrodeServices = angular.module('electrodeServices', ['ngResource']);

electrodeServices.factory('electrode', ['$resource',
  function($resource){
    return $resource( base_url + 'notebooks/electrode/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);

var neuronServices = angular.module('neuronServices', ['ngResource']);

neuronServices.factory('neuron', ['$resource',
  function($resource){
    return $resource( base_url + 'notebooks/neuron/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);

var protocolServices = angular.module('protocolServices', ['ngResource']);

protocolServices.factory('protocol', ['$resource',
  function($resource){
    return $resource( base_url + 'notebooks/protocol/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);

var CellTypeService = angular.module('CellTypeService', ['ngResource']);

CellTypeService.factory('CellType', ['$resource',
  function($resource){
    return $resource( base_url + 'neuralstructures/celltype/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false}
    });
  }]);

var CellService = angular.module('CellService', ['ngResource']);

CellService.factory('Cell', ['$resource',
  function($resource){
    return $resource( base_url + 'neuralstructures/cell/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);


var DeviceTypeService = angular.module('DeviceTypeService', ['ngResource']);

DeviceTypeService.factory('DeviceType', ['$resource',
  function($resource){
    return $resource( base_url + 'devices/type/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false}
    });
  }]);
