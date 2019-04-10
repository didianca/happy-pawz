const Joi = require('joi');
const mongoose = require('mongoose');
const moment = require('moment');

const rentalSchema = new mongoose.Schema({
    owner: {
        type: new mongoose.Schema({
            user: {
                type: new mongoose.Schema({
                    name: {
                        type: String,
                        required: true,
                        minlength: 4,
                        maxlength: 50
                    },
                    phone: {
                        type: String,
                        required: true,
                        minlength: 5,
                        maxlength: 50
                    }
                })
            },
            address: {
                type: String,
                required: true,
                minlength: 10,
                maxlength: 255
            }
        }),
        required: true
    },
    room: {
        type: new mongoose.Schema({
            dailyRentalRate: {
                type: Number,
                required: true,
                min: 0,
                max: 255
            },
            size:{
                type: String,
                required: true,
                minlength: 5,
                maxlength: 255
            },
            outdoorAccess:{
                type: Boolean,
                default: false
            }
        }),
        required: true
    },
    pet:{
      type: new mongoose.Schema({
          name: {
              type: String,
              required: true,
              minlength: 1,
              maxlength: 50
          }
      })
    },
    dateOut: {type: Date, required: true, default: Date.now},
    dateReturned: {type: Date},
    rentalFee: {type: Number, min: 0}
});
rentalSchema.statics.lookup = function (ownerId,roomId,petId) {
    return  this.findOne({
        "owner._id": ownerId,
        "room._id": roomId,
        "pet._id":petId
    });
};
rentalSchema.methods.return = function () {
    this.dateReturned = Date.now();
    const rentalDays = moment().diff(this.dateOut, 'days');
    this.rentalFee = (rentalDays * this.room.dailyRentalRate);
    return this.rentalFee
};
const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(rental) {
    const schema = {
        ownerId: Joi.objectId().required(),
        roomId: Joi.objectId().required(),
        petId: Joi.objectId().required()
    };
    return Joi.validate(rental, schema);
}
exports.validateRental = validateRental;
exports.Rental = Rental;