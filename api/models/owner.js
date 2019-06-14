//import all needed packages/modules
const Joi = require('joi');
const mongoose = require('mongoose');
//create object schema
const ownerSchema = new mongoose.Schema({
    user: { //assign the ownership to a specific user and find him by userId
        type: new mongoose.Schema({
            name:{
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
    pets:{ //get owned pets names in an arr
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
//create this object based on the schema
const Owner = mongoose.model('Owner', ownerSchema);
//validate user input with joi npm package
function validateOwner(owner) {
    const schema = {
        user:Joi.objectId().required(),
        address: Joi.string().min(10).max(255).required()
    };

    return Joi.validate(owner, schema);
}
//export schema for creating new instances
//export Object for accessing instances in db
//exporting validating function
exports.ownerSchema= ownerSchema;
exports.Owner = Owner;
exports.validateOwner = validateOwner;