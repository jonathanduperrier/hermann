'use strict';
/* Controllers */
var mod_images = angular.module( 'hermann.image', [
    'ngResource',
    'ngRoute',
    'hermann.people',
    'ui.bootstrap',
    'angularModalService',
    'mod_tlv',
    'imageServices',
    'fileServices',
    'supplierServices',
    'ngRoute',
    ]);

    mod_images.controller('ListImages', [
      '$scope', '$rootScope', 'image' ,'ModalService', 'files', 'fileLocation', '$route',
      function($scope, $rootScope, image, ModalService, files, fileLocation, $route) {
        $rootScope.page_title = "Images";
        $scope.$route = $route;
        $rootScope.spin = 0;
      	$scope.image = image.get({}, function(data){
          $scope.image.objects.forEach( function( image ){
            var $images = image.resource_uri.split('/');
            var $idImage = $images[3];
            image.id = $idImage;
            var file0 = image.file.split('/');
            var idFile = file0[3];
            $scope.file = files.get({id:idFile}, function(file){
              var location0 = $scope.file.location.split('/');
              var idLocation = location0[3];
              $scope.location = fileLocation.get({id:idLocation}, function(data){
                //$scope.file.location = data.path;
                image.file = data.path + file.name;
              });
            });
          });
        });
        $scope.predicate = 'caption';
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

    mod_images.controller('DetailImages', ['$scope', '$rootScope', '$routeParams', 'image', 'files', 'fileLocation' ,'ModalService',
    function($scope, $rootScope, $routeParams, image, files, fileLocation, ModalService){
        $rootScope.page_title = "Images";
        $scope.image = image.get( {id: $routeParams.eID}, function(data){
          var $image = $scope.image.resource_uri.split('/');
          var $idImage = $image[3];
          $scope.image.id = $idImage;

          var $images = $scope.image.resource_uri.split('/');
          var $idImage = $images[3];
          image.id = $idImage;
          var file0 = $scope.image.file.split('/');
          var idFile = file0[3];
          $scope.file = files.get({id:idFile}, function(file){
            var location0 = $scope.file.location.split('/');
            var idLocation = location0[3];
            $scope.location = fileLocation.get({id:idLocation}, function(data){
              //$scope.image.file = file.location + file.name;
              $scope.image.file = data.path + $scope.file.name;
            });
          });

        });
      }
    ]);
