const express = require('express');
const router = express.Router();
const {Room} = require('../models/room');
const {Rental} = require('../models/rental');
const {Pet} = require('../models/pet');
const Joi = require('joi');
const validate = require('../middleware/validate');

router.post('/', validate(validateReturn), async (req, res) => {
    const rental = await Rental.lookup(req.body.ownerId,req.body.roomId,req.body.petId);

    if (!rental) return res.status(404).send("The rental was not found");
    if (rental.dateReturned) return res.status(400).send('The return was already processed');

    rental.return();
    await rental.save();

    await Room.update({_id: rental.room._id}, {
        $inc: {numberOfAvailable: +1}
    });
    await Pet.update({_id: rental.pet._id},{
        $set:{isAccommodated:false}
    });

    res.send(rental)
});



function validateReturn(req) {
    const schema = {
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required(),
        petId: Joi.objectId().required()
    };
    return Joi.validate(req, schema);
}

module.exports = router;