const {  createLogger, transports, format } = require('winston');
require('winston-mongodb');

const logger = createLogger({
    exitOnError: false,//<-- doesn't work. it still ends the process
    transports: [
        new transports.Console({format: format.combine(format.colorize(),format.simple())}),
        new transports.File({ filename: './uncaughtExceptions.log', level: 'info'}),
        new transports.MongoDB({
            level: 'info',
            db: 'mongodb://localhost/vidly',
            collection:'uncaughtExceptions',
        })

    ]
});

module.exports = logger;