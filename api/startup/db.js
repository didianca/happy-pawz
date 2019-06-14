//set up db connection
const winston = require('winston');  //console logging
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const config = require('config'); //use config to dynamically assign variables and prevent security issues

module.exports=function () {
    const db = config.get('db'); //see /spi/config/default for more info
    mongoose.connect(db,{useNewUrlParser:true})
        .then(() => winston.info(`Connected to ${db}...`)) //success case
        .catch((e)=>{winston.err(`Error: ${e} ...`)}) //handling promise rejections
};