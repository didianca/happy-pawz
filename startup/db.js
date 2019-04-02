const winston = require('winston');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const config = require('config');

module.exports=function () {
    const db = config.get('db');
    mongoose.connect(db)
        .then(() => winston.info(`Connected to ${db}...`))
};