///Handling Exceptions && Rejections
require('express-async-errors');
const logger = require('../middleware/logger');

module.exports = function () {
  process.on('uncaughtException', (ex) => {
    console.log('WE GOT AN UNCAUGHT EXCEPTION');
    logger.error(ex.message, ex);
  });

  process.on('unhandledRejection', (ex) => {
    throw ex
  });
};