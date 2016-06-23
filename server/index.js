'use strict';

const path = require('path');
const fs     = require('fs');
const {Server} = require('hapi');

class Site extends Server {

    constructor(option) {

        option = Object.assign(
            {
                port : 443,
                key  : './key/localhost.key',
                cert : './cert/localhost-chain.cert'
            },
            option
        );

        super({
            connections : {
                routes : {
                    files : {
                        relativeTo : path.join(__dirname, 'store')
                    }
                }
            }
        });

        super.connection({
            port : option.port,
            tls  : {
                key  : fs.readFileSync(option.key),
                cert : fs.readFileSync(option.cert)
            }
        });
    }

    start() {
        return super.register([
                // Static file serving.
                require('inert'),
                // View templating.
                require('vision')
            ])
            .then(() => {

                // Use the views plugin we registered with the server
                // to configure how it will render templates.
                this.views({
                    engines : {
                        html : require('handlebars')
                    },
                    relativeTo   : path.join(__dirname, 'view'),
                    path         : './',
                    // Name of the default layout file. Can be overriden in routes.
                    layout       : 'default-layout',
                    // Directory name where layouts are stored.
                    layoutPath   : 'layout',
                    // Directory name where partials are stored.
                    partialsPath : 'partial',
                    // Directory name where helpers are stored.
                    helpersPath  : 'helper'
                });

                // TODO: Import all from directory, like require-dir.
                super.route([
                    require('./route/status'),
                    require('./route/cert')
                ]);

                // TODO: Simply return the promise once hapijs/hapi#3217 is resolved.
                // https://github.com/hapijs/hapi/issues/3217

                // return super.start();

                return new Promise((resolve, reject) => {
                    super.start((err) => {

                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();
                    });
                });
            });
    }
}

module.exports = {
    Site
};

