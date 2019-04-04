const Joi = require('joi');
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    userName: {
        type: new mongoose.Schema({
            name:{
                type: String,
                required: true,
                minlength: 4,
                maxlength: 50
            }
        })
    },
    pets:{ //names
        type: Array
    },
    address:{
        type: String,
        required: true,
        minlength:10,
        maxlength: 255
    },
    dateRegistered: {type: Date, default: Date.now}
});
const Owner = mongoose.model('Owner', ownerSchema);


function validateOwner(owner) {
    const schema = {
        userName:Joi.objectId().required(),
        address: Joi.string().min(10).max(255).required(),
       // pets: Joi.array().items(Joi.string().min(1)).required(),
    };

    return Joi.validate(owner, schema);
}
exports.ownerSchema= ownerSchema;
exports.Owner = Owner;
exports.validateOwner = validateOwner;