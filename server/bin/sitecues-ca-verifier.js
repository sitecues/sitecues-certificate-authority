#!/usr/bin/env node

// The command line interface for the sitecues Proxy.

// TODO: Use port-drop when it becomes viable.
// https://github.com/hapijs/hapi/issues/3204

'use strict';

// Crash and burn, die fast if a rejected promise is not caught.
require('throw-rejects/register');

const chalk = require('chalk');

const cli = require('meow')(`
    Usage
      $ sitecues-ca-verifier

    Options
      --port  Listen on a specific port for requests

    Examples
      $ sitecues-ca-verifier
      ${chalk.bold.cyan('Verify CA')} ${chalk.bold.grey('at')} ${chalk.bold.yellow('https://localhost/verify')}
      $ sitecues-ca-verifier --port=7000
      ${chalk.bold.cyan('Verify CA')} ${chalk.bold.grey('at')} ${chalk.bold.yellow('https://localhost:7000/verify')}
`);

const {Site} = require('../');
const server = new Site(cli.flags);

let cancelled = false;

process.on('SIGINT', () => {

    if (cancelled) {
        console.warn('\nShutting down immediately. You monster!');
        process.exit(1);
    }

    cancelled = true;

    console.warn('\nShutting down. Please wait or hit CTRL+C to force quit.');

    server.stop();
});

const rootCheck = require('root-check');
const {SecurityError} = require('../lib/error');

server.start().then(() => {
    // Attempt to set UID to a normal user now that we definitely
    // do not need elevated privileges.
    rootCheck(
        chalk.red.bold('I died trying to save you from yourself.\n') +
        (new SecurityError('Unable to let go of root privileges.')).stack
    );

    console.log(
        chalk.bold.cyan('Verify CA'),
        chalk.bold.grey('at'),
        chalk.bold.yellow(server.info.uri)
    );
});
