const express = require('express');
const app = express();
const winston = require('winston');
const console = new winston.transports.Console();

winston.add(console);

require('./api/startup/logging')();
require('./api/startup/routes')(app);
require('./api/startup/db')();
require('./api/startup/config')();
require('./api/startup/validation')();



//PORT
const port = process.env.PORT || 5000;
const server = app.listen(port, () => winston.info(`Listening on port ${port}..`));

module.exports = server;