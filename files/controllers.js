'use strict';
/* Controllers */
var mod_files = angular.module( 'hermann.file', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'ui.bootstrap',
    'angularModalService',
    'mod_tlv',
    'fileServices',
    'supplierServices',
    'ngRoute',
    'fileLocationServices',
    ]);

    mod_files.controller('ListFiles', [
      '$scope', '$rootScope', 'files' ,'ModalService', '$route', 'fileLocation',
      function($scope, $rootScope, files, ModalService, $route, fileLocation) {
        $rootScope.page_title = "Files";
        $scope.$route = $route;
        $rootScope.spin = 0;
      	$scope.file = files.get({}, function(data){
          $scope.file.objects.forEach( function( file ){
            var $file = file.resource_uri.split('/');
            var $idFile = $file[3];
            file.id = $idFile;
            var location0 = file.location.split('/');
            var idLocation = location0[3];
            $scope.location = fileLocation.get({id:idLocation}, function(data){
              file.location = data.path;
            });
          });
        });
        $scope.predicate = 'name';
        $scope.reverse = false;

        $scope.order = function(predicate) {
          $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
          $scope.predicate = predicate;
        };

        $scope.stopSpin = function() {
          if($rootScope.spin == 1){
            setTimeout(function(){ angular.element(window).spin(); }, 3500);
          }
          $rootScope.spin = 0;
        };
      }
    ]);

    mod_files.controller('DetailFiles', ['$scope', '$rootScope', '$routeParams', 'files' ,'ModalService', 'fileLocation',
    function($scope, $rootScope, $routeParams, files, ModalService, fileLocation){
        $rootScope.page_title = "Files";
        $scope.file = files.get( {id: $routeParams.eID}, function(data){
          var $file = $scope.file.resource_uri.split('/');
          var $idFile = $file[3];
          $scope.file.id = $idFile

          var location0 = $scope.file.location.split('/');
          var idLocation = location0[3];
          $scope.location = fileLocation.get({id:idLocation}, function(data){
            $scope.file.location = data.path;
          });
        });
      }
    ]);
