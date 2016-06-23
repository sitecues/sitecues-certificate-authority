'use strict';

module.exports = {
    method  : 'GET',
    path    : '/cert',
    handler : {
        file : './root-ca/root-ca.cert';
    }
};
