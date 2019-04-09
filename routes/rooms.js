const {Room, validateRoom,validateRoomUpdate} = require('../models/room');
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
router.post('/', validate(validateRoom), async (req, res) => {
    const caretaker = await Employee.findOne({_id: req.body.caretakerId});
    if (!caretaker) return res.status(400).send('Invalid caretaker...');

    const maid = await Employee.findOne({_id: req.body.maidId});
    if (!maid) return res.status(400).send('Invalid maid...');

    let room = await Room.findOne({size: req.body.size, level: req.body.level});
    if (room) return res.status(400).send('Room already registered');

    room = new Room({
        size: req.body.size,
        caretaker: {
            _id: caretaker._id,
            name: caretaker.name,
            phone: caretaker.phone
        },
        maid: {
            _id: maid._id,
            name: maid.name,
            phone: maid.phone
        },
        level: req.body.level
    });
    room.setOutdoorAccess();
    room.setDailyRentalRate();

    await room.save();

    res.send(room);
});

//UPDATE existing
router.put('/:id', validate(validateRoomUpdate), async (req, res) => {
    const caretaker = await Employee.findOne({_id: req.body.caretakerId});
    if (!caretaker) return res.status(400).send('Invalid caretaker...');

    const maid = await Employee.findOne({_id: req.body.maidId});
    if (!maid) return res.status(400).send('Invalid maid...');

    const room = await Room.findOneAndUpdate({_id: req.params.id}, {
        caretaker: {
            _id: caretaker._id,
            name: caretaker.name,
            phone: caretaker.phone
        },
        maid: {
            _id: maid._id,
            name: maid.name,
            phone: maid.phone
        }
    }, {new: true});
    room.setOutdoorAccess();
    room.setDailyRentalRate();
    if (!room) return res.status(404).send('The room with the given ID was not found.');
    res.send(room);
});

//DEL existing
router.delete('/:id', async (req, res) => {
    const room = await Room.findOneAndDelete({_id:req.params.id});
    if (!room) return res.status(404).send('The room with the given ID was not found.');
    res.send(room);
});

//GET one
router.get('/:id', async (req, res) => {
    const room = await Room.findOne({_id: req.params.id});
    if (!room) return res.status(404).send('The room with the given ID was not found');
    res.send(room);
});

module.exports = router;

