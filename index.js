const express = require('express');
const app = express();
const winston = require('winston');
const console = new winston.transports.Console();
const path = require('path');

winston.add(console);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

require('./api/startup/logging')();
require('./api/startup/routes')(app);
require('./api/startup/db')();
require('./api/startup/validation')();

//PORT
const port = process.env.PORT || 5000;
const server = app.listen(port, () => winston.info(`Listening on port ${port}..`));

module.exports = server;