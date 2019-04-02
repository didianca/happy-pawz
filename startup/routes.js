const express= require('express');
const employees = require('../routes/employees');
const roles = require('../routes/roles');
const rooms = require('../routes/rooms');
const users = require('../routes/users');
const error= require('../middleware/error');

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/employees',employees);
    app.use('/api/roles',roles);
    app.use('/api/rooms',rooms);
    app.use('/api/users',users);
    app.use(error);
};