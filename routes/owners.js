const {Owner, validateOwner} = require('../models/owner');
const validate = require('../middleware/validate');
const express = require('express');
const router = express.Router();
const {User} = require('../models/user');
const Fawn = require('fawn');
const mongoose = require('mongoose');
//mustn't send owner in the response cuz it contains user id


Fawn.init(mongoose);

//GET all
router.get('/', async (req, res) => {
    const owner = await Owner
        .find()
        .sort({name: 1});
    res.send(owner);
});
//POST new
router.post('/',validate(validateOwner), async (req, res) => {
    const user = await User.findOne({_id : req.body.user});
    if(!user) return res.status(400).send('Invalid user...');

    if(user.isOwner) return res.status(400).send('You have already become an owner.');

    const owner = new Owner({
        user:{
            _id: user._id,
            name: user.name,
            phone: user.phone
        },
        address: req.body.address
    });

    try{
        new Fawn.Task()
            .save('owners',owner)
            .update('users',{_id:user._id},{
                $set: {isOwner: true},
            })
            .run();
        res.send(owner);
    }catch (e) {
        res.status(500).send(e.message); //something went wrong
    }
});

//PUT existing
router.put('/:id',validate(validateOwner), async (req, res) => {
    const user = await User.findOne({_id : req.body.user});
    if(!user) return res.status(400).send('Invalid user...');

    const owner = await Owner.findOneAndUpdate({_id:req.params.id}, {
        user:{
            _id: user._id,
            name: user.name,
            phone: user.phone
        },
        address: req.body.address
    }, {new: true});
    if (!owner) return res.status(404).send('The owner object with the given ID was not found.');

    res.send(owner);
});

//DELETE existing
router.delete('/:id', async (req, res) => {
    const owner = await Owner.findOneAndDelete({_id:req.params.id});
    if (!owner) return res.status(404).send('The owner object with the given ID was not found.');
    res.send(owner);
});
//GET existing
router.get('/:id', async (req, res) => {
    const owner = await Owner.findOne({_id:req.params.id});
    if (!owner) return res.status(404).send('The owner object with the given ID was not found');
    res.send(owner);
});
module.exports =router;
