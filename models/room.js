const Joi = require('joi');
const mongoose = require('mongoose');
const {employeeSchema} = require('./employee');

const roomSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    caretaker:{
        type: employeeSchema,
        required:true
    },
    maid:{
        type: employeeSchema,
        required:true
    },
    numberOfAvailable:{
        type:Number,
        required: true,
        min: 0,
        max: 10
    },
    dailyRentalRate:{
        type:Number,
        required: true,
        min: 50, //multiples //no outdoor access //last half of lvl
        //75 //multiples//no outdoor access //first half of lvl
        //125 //singles //no outdoor access // last half lvl
        //150//singles // no outdoor access //first half of lvl
        //200//multiples// outdoor access // first lvl
        max: 250 //singles// outdoor access // first lvl
    },
    level:{
      type: Number,
      required:true,
      min: 0,
      max: 3
    },
    outdoorAccess:{
        type: Boolean,
        default: false
    },
    date: {type: Date, default: Date.now}
});
const Room = mongoose.model('Room',roomSchema);

function validateRoom(room) {
    const schema = {
        type: Joi.string().min(5).max(255).required(),
        caretakerId:Joi.objectId().required(),
        maidId:Joi.objectId().required(),
        numberOfAvailable: Joi.number().min(0).max(10).required(),
        dailyRentalRate: Joi.number().min(50).max(250).required(),
        level: Joi.number().min(0).max(3).required(),
        outdoorAccess: Joi.boolean().required()
    };
    return Joi.validate(room, schema);
}

exports.roomSchema = roomSchema;
exports.Room = Room;
exports.validateRoom = validateRoom;