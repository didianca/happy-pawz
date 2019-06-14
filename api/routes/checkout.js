//import all needed packages/modules
const express = require('express');
const router = express.Router();
const {Room} = require('../models/room');
const {Pet} = require('../models/pet');
const {Rental} = require('../models/rental');
const Joi = require('joi');
const validate = require('../middleware/validate');
const auth  = require('../middleware/auth'); //authorize
//modify the existing rental
router.post('/',[auth, validate(validateCheckout)], async (req, res) => {
    //get the existing rental
    const rental = await Rental.lookup(req.body.ownerId, req.body.roomId, req.body.petId);
    //prevent possible error cases
    if (!rental) return res.status(404).send("The rental was not found");
    if (rental.dateReturned) return res.status(400).send('The return was already processed');
    //use checkOut method to assigned rental Fee owed. see /api/models/rental for more details
    rental.checkOut();
    //save changes
    await rental.save();
    //cleanup db:
    await Room.updateOne({_id: rental.room._id}, {
        $inc: {numberOfAvailable: +1}
    });
    await Pet.updateOne({_id: rental.pet._id}, {
        $set: {isAccommodated: false}
    });
    res.send(rental);
});
//validate user input for rental modification
function validateCheckout(req) {
    const schema = {
        ownerId: Joi.objectId().required(),
        roomId: Joi.objectId().required(),
        petId: Joi.objectId().required()
    };
    return Joi.validate(req, schema);
}
//export route to be implemented
//see /api/startup/routes
module.exports = router;