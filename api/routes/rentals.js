//import all needed packages/modules
const {Rental, validateRental} = require('../models/rental');
const {Room} = require('../models/room');
const {Owner} = require('../models/owner');
const {Pet} = require('../models/pet');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();
//GET one by id api/rentals/:id
router.get('/:id', admin,async (req, res) => {
    const rental = await Rental.findOne(req.params.id);
    if (!rental) return res.status(404).send('The rental object with the given ID was not found');
    res.send(rental);
});
//POST new api/rentals
router.post('/',[auth,validate(validateRental)], async (req, res) => {
    //check for owner in db
    const owner = await Owner.findOne({_id: req.body.ownerId});
    if (!owner) return res.status(400).send('Invalid owner...');
    //check for room in db
    const room = await Room.findOne({_id: req.body.roomId});
    if (!room) return res.status(400).send('Invalid room');
    if (room.numberOfAvailable === 0) return res.status(400).send('There is no available room with the given specifications');
    //check for pet in db
    const pet = await Pet.findOne({_id: req.body.petId});
    if (!pet) return res.status(400).send('Invalid pet');
    if(pet.isAccommodated) return res.status(400).send('Pet already accommodated.');
    //create new instance of the rental object
    let rental = new Rental({
        owner: {
            _id: owner._id,
            user: {
                name: owner.userId.name,
                phone: owner.userId.phone
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
    //deal with transactions
    try {
        new Fawn.Task()
            .save('rentals',rental) //save the rental
            .update('rooms', {_id: room._id}, {
                $inc: {numberOfAvailable: -1}               //reduce the number of available rooms
            })
            .update('pets',{_id: pet._id},{
                $set:{isAccommodated: true}                 //accommodate the pet so it can not be accommodated twice
            })
            .run(); //run the task
        res.send(rental)
    } catch (e) {
        res.status(500).send(e.message);
    }
});
module.exports = router;