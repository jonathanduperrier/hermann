var timeLineServices = angular.module('timeLineServices', ['ngResource']);

timeLineServices.factory('timeLine', ['$resource',
  function($resource){
    return $resource('http://helm1/notebooks/timeline/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }}
    });
  }]);

var eventServices = angular.module('eventServices', ['ngResource']);

eventServices.factory('events', ['$resource',
  function($resource){
    return $resource('http://helm1/notebooks/event/', {}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }}
    });
  }]);
