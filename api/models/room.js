const Joi = require('joi');
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255//only 2 types of single and 2 of multiple
    },
    caretaker: {
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
    maid: {
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
    numberOfAvailable: {
        type: Number,
        required: true,
        default: 10
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 100
    },
    level: {
        type: Number,
        required: true,
        min: 0,
        max: 3//only 2 ground floor and 2 first floor
    },
    outdoorAccess: {
        type: Boolean,
        default: false
    },
    date: {type: Date, default: Date.now}
});

roomSchema.methods.setOutdoorAccess = function () {
    if (this.level === 0) return this.outdoorAccess = true
};
roomSchema.methods.setDailyRentalRate = function () {
    if (this.outdoorAccess === true && this.size === "single") return this.dailyRentalRate = 250;
    if (this.outdoorAccess === true && this.size === "multiple") return this.dailyRentalRate = 200;
    if (this.outdoorAccess === false && this.size === "single") return this.dailyRentalRate = 150;
    if (this.outdoorAccess === false && this.size === "multiple") return this.dailyRentalRate = 100;
};


const Room = mongoose.model('Room', roomSchema);

function validateRoom(room) {
    const schema = {
        size: Joi.string().min(5).max(255).required(),
        caretakerId: Joi.objectId().required(),
        maidId: Joi.objectId().required(),
        level: Joi.number().min(0).max(3).required()
    };
    return Joi.validate(room, schema);
}
function validateRoomUpdate(room){
    const schema = {
        caretakerId: Joi.objectId().required(),
        maidId: Joi.objectId().required()
    };
    return Joi.validate(room, schema);
}

exports.roomSchema = roomSchema;
exports.Room = Room;
exports.validateRoom = validateRoom;
exports.validateRoomUpdate = validateRoomUpdate;