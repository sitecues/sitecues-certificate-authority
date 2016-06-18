'use strict';

process.on('unhandledRejection', (err) => {
    throw err;
});

const hapi = require('hapi');
const server = new hapi.Server();
const fs = require('fs');

server.connection({
    port : 443,
    tls  : {
        key  : fs.readFileSync('./private/localhost.key'),
        cert : fs.readFileSync('./cert/ca-chain.cert')
    }
});

server.route({
    method  : 'GET',
    path    : '/status',
    handler : function (request, reply) {
        reply('ok');
    }
});

server.route({
    method  : 'GET',
    path    : '/cert',
    handler : function (request, reply) {
        reply('coming soon');
    }
});

server.start();
