'use strict';

var fileServices = angular.module('fileServices', ['ngResource']);

fileServices.factory('files', ['$resource',
  function($resource){
    return $resource( base_url + 'storage/file/:id', {id:'@eId'}, {
      get: {method:'GET', params:{format:'json'}, isArray:false},
      put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
      post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
      del: { method: 'DELETE', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
    });
  }]);

  var fileLocationServices = angular.module('fileLocationServices', ['ngResource']);

  fileLocationServices.factory('fileLocation', ['$resource',
    function($resource){
      return $resource( base_url + 'storage/filelocation/:id', {id:'@eId'}, {
        get: {method:'GET', params:{format:'json'}, isArray:false},
        put: {method:'PUT', params:{format:'json'}, headers:{ 'Content-Type':'application/json' }},
        post: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
        del: { method: 'DELETE', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } }
      });
    }]);
