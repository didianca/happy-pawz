//import all needed packages/modules
const {Owner, validateOwner} = require('../models/owner');
const validate = require('../middleware/validate');
const {User} = require('../models/user');
const Fawn = require('fawn');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const express = require('express');
const router = express.Router();
//Fawn needs to be initiated so it can be used later (see POST req)
Fawn.init(mongoose);
//GET all api/owners
router.get('/', auth, async (req, res) => {
    //get owner from db
    const owner = await Owner.find({});
    res.send(owner);
});
//POST new api/owners
router.post('/', [auth, validate(validateOwner)], async (req, res) => {
    //check for existence
    const user = await User.findOne({_id: req.body.user});
    if (!user) return res.status(400).send('Invalid user...');
    //check ownership
    if (user.isOwner) return res.status(400).send('You are already an owner');
    let owner = await Owner.findOne({user});
    if (owner) return res.status(400).send('Owner already registered');
    //create new instance of the Owner Class with info provided in the body of the request
    owner = new Owner({
        user: {
            _id: user._id,
            name: user.name,
            phone: user.phone
        },
        address: req.body.address
    });
    //dealing with lack of transactions in mongodb
    /*---> transactions were added in 4.0 but they were non-existent when this api was built and it is simply easier to leave it as such<---*/
    try {
        new Fawn.Task() //create new TASk
            .save('owners', owner) //save owner changes
            .update('users', {_id: user._id}, { //update users db  by userId and change isOwner property
                $set: {isOwner: true},
            })
            .run(); //run the task for it to take place
        res.send(owner);
    } catch (e) {
        res.status(500).send(e.message);
    }
});
//UPDATE existing api/owners/:id
router.put('/:id', [auth, validate(validateOwner), validateObjectId], async (req, res) => {
    //check for existence in db
    const user = await User.findOne({_id: req.body.user});
    if (!user) return res.status(400).send('Invalid user...');
    //query by params and upate with info in body of req
    const owner = await Owner.findOneAndUpdate({_id: req.params.id}, {
        user: {
            _id: user._id,
            name: user.name,
            phone: user.phone
        },
        address: req.body.address
    }, {new: true});
    //if bad params -> 404
    if (!owner) return res.status(404).send('The owner with the given ID was not found.');
    res.send(owner);
});
//DELETE existing  api/owners/:id
router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    //query by params and delete
    const owner = await Owner.findOneAndDelete({_id: req.params.id});
    //if bad params -> 404
    if (!owner) return res.status(404).send('The owner object with the given ID was not found.');
    res.send(owner);
});
//GET existing  api/owners/:id
router.get('/:id', [auth, validateObjectId], async (req, res) => {
    //query by params
    const owner = await Owner.findOne({_id: req.params.id});
    //if bad params -> 404
    if (!owner) return res.status(404).send('The owner object with the given ID was not found');
    res.send(owner);
});
//export route to be implemented
//see /api/startup/routes
module.exports = router;
