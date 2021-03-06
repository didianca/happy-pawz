//import all needed packages/modules
const express = require('express');
const {Room, validateRoom} = require('../models/room');
const validate = require('../middleware/validate');
const router = express.Router();
const {Employee} = require('../models/employee');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const validateObjectId= require('../middleware/validateObjectId');
//GET all api/rooms
router.get('/', async (req, res) => {
    //get rooms sorted by:
    const roomsByDailyRentalRate = await Room
        .find()
        .sort("dailyRentalRate");
    const roomsByOutdoorAccess = await Room
        .find()
        .sort({outdoorAccess:1});
    const roomsByLevel = await Room
        .find()
        .sort({level:1});
    res.send(roomsByDailyRentalRate);
});
//POST new api/rooms
router.post('/',[auth,admin,validate(validateRoom)], async (req, res) => {
    //check for proper input:
    //caretakerId
    const caretaker = await Employee.findOne({_id: req.body.caretaker});
    if (!caretaker) return res.status(400).send('Invalid caretaker...');
    //maidId
    const maid = await Employee.findOne({_id: req.body.maid});
    if (!maid) return res.status(400).send('Invalid maid...');
    //roomId - ? duplication ?
    let room = await Room.findOne({size: req.body.size, level: req.body.level});
    if (room) return res.status(400).send('Room already registered');
    //create new instance of the room class
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
    //automatically set the outdoor access
    room.setOutdoorAccess();
    //automatically set rental fee and room name
    room.setDailyRentalRateAndName();
    //save changes to db
    await room.save();
    res.send(room);
});
//DEL existing api/rooms/:id
router.delete('/:id', [validateObjectId,auth,admin,validate(validateRoom)], async (req, res) => {
    const room = await Room.findOneAndDelete({_id:req.params.id});//find in db and del
    //if it doesn't exist let the user know
    if (!room) return res.status(404).send('The room with the given ID was not found.');
    res.send(room);
});
//GET one api/rooms/:id
router.get('/:id',validateObjectId,async (req, res) => {
    //retrieve one from db
    const room = await Room.findOne({_id: req.params.id});
    // if it doesn't exist let user know
    if (!room) return res.status(404).send('The room with the given ID was not found');
    res.send(room);
});
//export route to be implemented
//see /api/startup/routes
module.exports = router;

