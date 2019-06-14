//setting up error logging in the console for easier debugging
const {  createLogger, transports, format } = require('winston');
const config = require('config');
const db = config.get('db');
require('winston-mongodb');

const logger = createLogger({
    exitOnError: false,//<-- doesn't work. it still ends the process
    transports: [
        new transports.Console({format: format.combine(format.colorize(),format.simple())}),//<--supposed to make it prettier...-,-
        new transports.File({ filename: './uncaughtExceptions.log', level: 'info'}),
        new transports.MongoDB({
            level: 'info',
            db,
            collection:'uncaughtExceptions',
        })

    ]
});

module.exports = logger;