const express= require('express');
const employees = require('../routes/employees');
const roles = require('../routes/roles');
const rooms = require('../routes/rooms');
const users = require('../routes/users');
const auth = require('../routes/auth');
const owners = require('../routes/owners');
const pets = require('../routes/pets');
const rentals = require('../routes/rentals');
const checkout = require('../routes/checkout');
const media = require('../routes/media');
const error= require('../middleware/error');

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/employees',employees);
    app.use('/api/roles',roles);
    app.use('/api/rooms',rooms);
    app.use('/api/users',users);
    app.use('/api/auth',auth);
    app.use('/api/owners',owners);
    app.use('/api/pets',pets);
    app.use('/api/rentals',rentals);
    app.use('/api/checkout',checkout);
    app.use('/api/media',media);
    app.use(error);
};