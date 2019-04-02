const {Room, validateRoom} = require('../models/room');
const validate = require('../middleware/validate');
const express = require('express');
const router = express.Router();
const {Employee} = require('../models/employee');

//GET all
router.get('/', async (req, res) => {
    const rooms = await Room
        .find()
        .sort("dailyRentalRate");
    res.send(rooms);
});

//POST new
router.post('/',validate(validateRoom), async (req, res) => {
    const caretaker = await Employee.findOne({_id : req.body.caretakerId});
    if(!caretaker) return res.status(400).send('Invalid caretaker...');
    const maid = await Employee.findOne({_id : req.body.maidId});
    if(!maid) return res.status(400).send('Invalid maid...');

    const room = new Room({
        type: req.body.type,
        caretaker:{
            _id: caretaker._id,
            name: caretaker.name,
            role: caretaker.role,
            phone: caretaker.phone,
            salary: caretaker.salary,
            qualificationRate: caretaker.qualificationRate
        },
        maid:{
            _id: maid._id,
            name: maid.name,
            role: maid.role,
            phone: maid.phone,
            salary: maid.salary,
            qualificationRate: maid.qualificationRate
        },
        numberOfAvailable:req.body.numberOfAvailable,
        level: req.body.level,
        dailyRentalRate:req.body.dailyRentalRate,
        outdoorAccess:req.body.outdoorAccess
    });
    await room.save();

    res.send(room);
});

//UPDATE existing
router.put('/:id', validate(validateRoom),async (req, res) => {
    const caretaker = await Employee.findOne({_id : req.body.caretakerId});
    if(!caretaker) return res.status(400).send('Invalid caretaker...');
    const maid = await Employee.findOne({_id : req.body.maidId});
    if(!maid) return res.status(400).send('Invalid maid...');

    const room = await Room.findByIdAndUpdate(req.params.id, {
        type: req.body.type,
        caretaker:{
            _id: caretaker._id,
            name: caretaker.name,
            role: caretaker.role,
            phone: caretaker.phone,
            salary: caretaker.salary,
            qualificationRate: caretaker.qualificationRate
        },
        maid:{
            _id: maid._id,
            name: maid.name,
            role: maid.role,
            phone: maid.phone,
            salary: maid.salary,
            qualificationRate: maid.qualificationRate
        },
        numberOfAvailable:req.body.numberOfAvailable,
        level: req.body.level,
        dailyRentalRate:req.body.dailyRentalRate,
        outdoorAccess:req.body.outdoorAccess
    }, {new: true});
    if (!room) return res.status(404).send('The room with the given ID was not found.');
    res.send(room);
});

//DEL existing
router.delete('/:id', async (req, res) => {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).send('The room with the given ID was not found.');
    res.send(room);
});

//GET one
router.get('/:id', async (req, res) => {
    const room = await Room.findOne({_id : req.params.id});
    if (!room) return res.status(404).send('The room with the given ID was not found');
    res.send(room);
});



module.exports = router;

