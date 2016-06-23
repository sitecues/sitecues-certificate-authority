'use strict';

const
    // Application metadata.
    pkg       = require('read-pkg-up').sync({cwd:__dirname}).pkg,
    // Pretty print JSON objects as strings.
    jsonAlign = require('json-align'),
    APP_NAME  = pkg.name,
    VERSION   = pkg.version;

module.exports = {
    method : 'GET',
    path   : '/status',
    handler(request, reply) {

        const status = {
            app        : APP_NAME,
            version    : VERSION,
            statusCode : 200,
            status     : 'OK',
            time       : (new Date()).toISOString(),
            process    : {
                title   : process.title,
                version : process.version,
                pid     : process.pid,
                uptime  : process.uptime()
            }
        };

        reply(jsonAlign(status))
        // Inform Hapi that our string is actually valid JSON.
        .type('application/json');
    }
};
