/* MAIN app*/
//run node index.js to start the api
const express = require('express');
const app = express();
const winston = require('winston');
const console = new winston.transports.Console();
winston.add(console);
//implementing all the modules in startup. see /api/startup/*module* for more details
require('./api/startup/logging')();
require('./api/startup/routes')(app);
require('./api/startup/db')();
require('./api/startup/config')();
require('./api/startup/validation')();

//PORT set up
const port = process.env.PORT || 5000;
const server = app.listen(port, () => winston.info(`Listening on port ${port}..`));

//export server to use it for testing
module.exports = server;