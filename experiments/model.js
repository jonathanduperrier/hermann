'use strict';

/* Experiment Module */

/**
 * Function for creating new instances of the service model
 * containing as well the source of data and the methods to access it
 */
mod_exp.factory( 
    'Experiment', // Object model
    function( $resource ){ // , $filter can be added if ngFilter is injected above
        return $resource( base_url + 'experiment/:id', { id:'@eId' },
        {
            get: { method: 'GET', params:{ format:'json' }, isArray: false },
            save: { method: 'POST', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
            put: { method:'PUT', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
            patch:  { method:'PATCH', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
            del: { method: 'DELETE', params:{ format:'json' }, headers:{ 'Content-Type':'application/json' } },
        });
    }
);

mod_exp.factory( 
    'Setup', // Object model
    function( $resource ){ // , $filter can be added if ngFilter is injected above
        return $resource( base_url + 'devices/setup/:id', { id:'@eId' },
        {
            get: { method: 'GET', params:{ format:'json' }, isArray: false },
        });
    }
);

mod_exp.factory( 
    'Researcher', // Object model
    function( $resource ){ // , $filter can be added if ngFilter is injected above
        return $resource( base_url + 'people/researcher/:id', { id:'@eId' },
        {
            get: { method: 'GET', params:{ format:'json' }, isArray: false },
        });
    }
);