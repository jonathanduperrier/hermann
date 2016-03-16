'use strict';

var imageServices = angular.module('imageServices', ['ngResource']);

imageServices.factory('image', ['$resource',
  function($resource){
    return $resource( base_url + 'analysis/image/:id', {id:'@eId'}, {
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
