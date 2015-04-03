'use strict';

/* Researcher Module */

var mod_people = angular.module( 'hermann.people', ['ngResource'] );

mod_people.config(['$resourceProvider', function($resourceProvider) {
  // Do not strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}]);

// since either researchers and supplier are accessed by their uri
// we only create the people object with different template
mod_people.factory( 
    'People', // Object model
    function( $resource ){ // , $filter can be added if ngFilter is injected above
        return $resource( base_url + ':uri', { uri:'@uri' },
        {
            get: { method: 'GET', params:{ format:'json' }, isArray: false },
        });
    }
);
