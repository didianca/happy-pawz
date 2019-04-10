const {Rental, validateRental} = require('../models/rental');
const {Room} = require('../models/room');
const {Owner} = require('../models/owner');
const {Pet} = require('../models/pet');
const validate = require('../middleware/validate');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

//GET all
router.get('/', async (req, res) => {
    const rentals = await Rental
        .find()
        .sort({dateOut: -1});
    res.send(rentals);
});

//POST new
router.post('/', validate(validateRental), async (req, res) => {
    const owner = await Owner.findOne({_id: req.body.ownerId});
    if (!owner) return res.status(400).send('Invalid owner...');

    const room = await Room.findOne({_id: req.body.roomId});
    if (!room) return res.status(400).send('Invalid room');
    if (room.numberOfAvailable === 0) return res.status(400).send('There is no available room with the given specifications');

    const pet = await Pet.findOne({_id: req.body.petId});
    if (!pet) return res.status(400).send('Invalid pet');
    if(pet.isAccommodated) return res.status(400).send('Pet already accommodated.');

    let rental = new Rental({
        owner: {
            _id: owner._id,
            user: {
                name: owner.user.name,
                phone: owner.user.phone
            },
            address: owner.address
        },
        room: {
            _id: room._id,
            size: room.size,
            outdoorAccess: room.outdoorAccess,
            dailyRentalRate: room.dailyRentalRate
        },
        pet:{
            _id:pet._id,
            name:pet.name
        }
    });

    try {
        new Fawn.Task()
            .save('rentals',rental)
            .update('rooms', {_id: room._id}, {
                $inc: {numberOfAvailable: -1}
            })
            .update('pets',{_id: pet._id},{
                $set:{isAccommodated: true}
            })
            .run();
        res.send(rental)
    } catch (e) {
        res.status(500).send(e.message);
    }
});
module.exports = router;