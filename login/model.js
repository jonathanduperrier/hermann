'use strict';

/**
 * Function for creating new instances of the service model
 * containing as well the source of data and the methods to access it
 */
mod_login.config(['$resourceProvider', function($resourceProvider) {
  // Do not strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}]);

mod_login.factory(
    'Login', // Object model
    function( $resource, $rootScope, $http, $location, $cookieStore ){ // , $filter can be added if ngFilter is injected above
        // define 'Logout' function
        $rootScope.showLogout = false;
        $rootScope.removeAuthorization = function(){
            //remove default
            $cookieStore.remove('username');
            $rootScope.showLogout = false;
            $http.defaults.headers.common['Authorization'] = null;
            $location.path( '/login' );
        };
        // resource definition
        return $resource( base_url + '/people/researcher', { }, // try to access just to check answer
        {
            get: { method: 'GET', params:{ format:'json' }, isArray: false },
        });
    }
);
