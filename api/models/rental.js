//import all needed packages/modules
const Joi = require('joi');
const mongoose = require('mongoose');
const moment = require('moment');
//create object schema
const rentalSchema = new mongoose.Schema({
    owner: { //give owner id to attach the rental to a specific owner (if not owner -> no pets -> can't rent)
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
    room: { //give room id to select exact room to rent
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
    pet:{ //give pet id to keep track on which pet is in which room
      type: new mongoose.Schema({
          name: {
              type: String,
              required: true,
              minlength: 1,
              maxlength: 50
          }
      })
    },
    dateOut: {type: Date, required: true, default: Date.now},//default
    dateReturned: {type: Date},//method to calculate
    rentalFee: {type: Number, min: 0} //method to calculate
});
//create lookup method to easily look up a rental
rentalSchema.statics.lookup = function (ownerId,roomId,petId) {
    return  this.findOne({
        "owner._id": ownerId,
        "room._id": roomId,
        "pet._id":petId
    });
};
//create checkOut method for assigning rental Fee owed
rentalSchema.methods.checkOut = function () {
    this.dateReturned = Date.now();
    const rentalDays = moment().diff(this.dateOut, 'days');
    this.rentalFee = (rentalDays * this.room.dailyRentalRate);
    return this.rentalFee
};
//create this object based on the schema
const Rental = mongoose.model('Rental', rentalSchema);
//validate user input with joi npm package
function validateRental(rental) {
    const schema = {
        ownerId: Joi.objectId().required(),
        roomId: Joi.objectId().required(),
        petId: Joi.objectId().required()
    };
    return Joi.validate(rental, schema);
}
//export Object for accessing instances in db
//exporting validating function
exports.validateRental = validateRental;
exports.Rental = Rental;