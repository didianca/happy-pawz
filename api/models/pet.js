//import all needed packages/modules
const Joi = require('joi');
const mongoose = require('mongoose');
//create object schema
const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    microChip: {
        type: String,
        required: true,
        minlength: 10,
        maxlength:50,
        unique:true
    },
    ownerInfo: {//access owner info by accessing the owner object through it's id
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 4,
                maxlength: 50
            }
        }),
        required:true
    },
    petRace: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    breed: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    birthYear: {
        type: Number,
        required: true,
    },
    castrated: {
        type: Boolean,
        default:false
    },
    petColor: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    sex: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    healthy: {
        type: Boolean,
        default:true
    },
    isAccommodated: {//automatically set when creating new rental
        type: Boolean,
        default: false
    },
    dateRegistered: {type: Date, default: Date.now}//default
});
//create this object based on the schema
const Pet = mongoose.model('Pet', petSchema);
//validate user input with joi npm package
function validatePet(pet) {
    const schema = {
        name: Joi.string().min(1).max(50).required(),
        microChip: Joi.string().min(10).max(50).required(),
        ownerInfo: Joi.objectId().required(),
        petRace: Joi.string().min(3).max(50).required(),
        breed: Joi.string().min(5).max(50).required(),
        birthYear: Joi.string().required(),
        castrated: Joi.boolean().required(),
        petColor: Joi.string().min(5).max(50).required(),
        sex: Joi.string().min(5).max(50).required(),
        healthy: Joi.boolean().required()
    };
    return Joi.validate(pet, schema);
}
//export schema for creating new instances
//export Object for accessing instances in db
//exporting validating function
exports.petSchema = petSchema;
exports.Pet = Pet;
exports.validatePet = validatePet;