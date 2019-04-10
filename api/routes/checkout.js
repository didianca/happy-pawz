const express = require('express');
const router = express.Router();
const {Room} = require('../models/room');
const {Pet} = require('../models/pet');
const {Rental} = require('../models/rental');
const Joi = require('joi');
const validate = require('../middleware/validate');

//modify the existing rental
router.post('/', validate(validateCheckout), async (req, res) => {
    const rental = await Rental.lookup(req.body.ownerId, req.body.roomId, req.body.petId);

    if (!rental) return res.status(404).send("The rental was not found");
    if (rental.dateReturned) return res.status(400).send('The return was already processed');

    rental.return();
    await rental.save();

    await Room.updateOne({_id: rental.room._id}, {
        $inc: {numberOfAvailable: +1}
    });
    await Pet.updateOne({_id: rental.pet._id}, {
        $set: {isAccommodated: false}
    });

});

function validateCheckout(req) {
    const schema = {
        ownerId: Joi.objectId().required(),
        roomId: Joi.objectId().required(),
        petId: Joi.objectId().required()
    };
    return Joi.validate(req, schema);
}


module.exports = router;