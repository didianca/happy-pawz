const {Owner, validateOwner} = require('../models/owner');
const validate = require('../middleware/validate');
const express = require('express');
const router = express.Router();
const {User} = require('../models/user');
const Fawn = require('fawn');
const mongoose = require('mongoose');
const _ = require('lodash');

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
    const user = await User.findOne({_id : req.body.userName});
    if(!user) return res.status(400).send('Invalid user...');

    if(user.isOwner) return res.status(400).send('You have already become an owner.');

    const owner = new Owner({
        userName:{
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
        res.send(_.pick(owner,['_id','userName.name','userName.phone','address','dateRegistered']));
    }catch (e) {
        res.status(500).send(e.message); //something went wrong
    }
});

//PUT existing
router.put('/:id',validate(validateOwner), async (req, res) => {
    const user = await User.findOne({_id : req.body.userName});
    if(!user) return res.status(400).send('Invalid user...');

    let petNames=req.body.pets;
    petNames.forEach((elem)=>{
        return elem
    });
    const owner = await Owner.findByIdAndUpdate(req.params.id, {
        userName:{
            _id: user._id,
            name: user.name
        },
        pets:petNames,
        address: req.body.address
    }, {new: true});
    if (!owner) return res.status(404).send('The owner object with the given ID was not found.');

    res.send(_.pick(owner,['userName.name','pets','address','dateRegistered']));
});

//DELETE existing
router.delete('/:id', async (req, res) => {
    const owner = await Owner.findByIdAndDelete(req.params.id);
    if (!owner) return res.status(404).send('The owner object with the given ID was not found.');
    res.send(_.pick(owner,['userName.name','pets','address','dateRegistered']));
});
//GET existing
router.get('/:id', async (req, res) => {
    const owner = await Owner.findById(req.params.id);
    if (!owner) return res.status(404).send('The owner object with the given ID was not found');
    res.send(_.pick(owner,['userName.name','pets','address','dateRegistered']));
});
module.exports =router;
