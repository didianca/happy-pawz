//setting up error logging to the console(for easier debugging) and the data base (for easily tracing bugs records)
const {  createLogger, transports, format } = require('winston');
const config = require('config');
const db = config.get('db');
require('winston-mongodb');

const logger = createLogger({
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