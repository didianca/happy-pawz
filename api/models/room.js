//import all needed packages/modules
const Joi = require('joi');
const mongoose = require('mongoose');
//create object schema
const roomSchema = new mongoose.Schema({
    name:{
        type:String
    },
    size: { //single /multiple
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    caretaker: { //find by id
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 255
            },
            phone: {
                type: String,
                minlength: 5,
                maxlength: 50,
                required: true
            }
        }),
        required: true
    },
    maid: { //find by id
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 255
            },
            phone: {
                type: String,
                minlength: 5,
                maxlength: 50,
                required: true
            }
        }),
        required: true
    },
    numberOfAvailable: { //automatically set
        type: Number,
        required: true,
        default: 10
    },
    dailyRentalRate: { //method to calculate
        type: Number,
        required: true,
        min: 100
    },
    level: { //level 0/1
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    outdoorAccess: { //method to set
        type: Boolean,
        default: false
    },
    date: {type: Date, default: Date.now}
});
//automatically setting the outdoor access to shorten the input required from the user
roomSchema.methods.setOutdoorAccess = function () {
    this.outdoorAccess = this.level === 0;
    return this.outdoorAccess;
};
//automatically setting the rental rate based on the rooms properties
roomSchema.methods.setDailyRentalRateAndName = function () {
    switch (this.size) {
        case 'single':
            switch (this.outdoorAccess) {
                case true:
                    this.dailyRentalRate =250;
                    this.name = 'S0';
                    break;
                case false:
                    this.dailyRentalRate=150;
                    this.name = 'S1';
                    break;
            }
            break;
        case 'multiple':
            switch (this.outdoorAccess) {
                case true:
                    this.dailyRentalRate=200;
                    this.name = 'M0';
                    break;
                case false:
                    this.dailyRentalRate=100;
                    this.name = 'M1';
                    break;
            }
            break;
    }
    return this.dailyRentalRate;
};
//create this object based on the schema
const Room = mongoose.model('Room', roomSchema);
//validate user input with joi npm package
function validateRoom(room) {
    const schema = {
        size: Joi.string().min(5).max(255).required(),
        caretaker: Joi.objectId().required(),
        maid: Joi.objectId().required(),
        level: Joi.number().min(0).max(3).required()
    };
    return Joi.validate(room, schema);
}
//export schema for creating new instances
//export Object for accessing instances in db
//exporting validating function
exports.roomSchema = roomSchema;
exports.Room = Room;
exports.validateRoom = validateRoom;