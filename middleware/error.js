const { createLogger, transports } = require('winston');
require('winston-mongodb');

const logger = createLogger({
    exitOnError: false,
    transports: [
        new transports.File({ filename: './logfile.log', level: 'info'}),
        new transports.Console(),
        new transports.MongoDB({
            level: 'info',
            db: 'mongodb://localhost/HappyPawz',
            collection:'logs',
        })
    ]
});

module.exports = (err, req, res, next) => {
    logger.error(err.message,err);
    res.status(500).send(err.message);
};