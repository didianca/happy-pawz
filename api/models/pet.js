const Joi = require('joi');
const mongoose = require('mongoose');

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
    ownerInfo: {
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
    age: {
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
    isAccommodated: {
        type: Boolean,
        default: false
    },
    dateRegistered: {type: Date, default: Date.now}
});
const Pet = mongoose.model('Pet', petSchema);

//petSchema.methods.something=function () {
  //needs to be called inside of the end point it'll be used in
 //calculate age
//}

function validatePet(pet) {
    const schema = {
        name: Joi.string().min(1).max(50).required(),
        microChip: Joi.string().min(10).max(50).required(),
        ownerInfo: Joi.objectId().required(),
        petRace: Joi.string().min(3).max(50).required(),
        breed: Joi.string().min(5).max(50).required(),
        age: Joi.number().required(),
        castrated: Joi.boolean().required(),
        petColor: Joi.string().min(5).max(50).required(),
        sex: Joi.string().min(5).max(50).required(),
        healthy: Joi.boolean().required()
    };
    return Joi.validate(pet, schema);
}

exports.petSchema = petSchema;
exports.Pet = Pet;
exports.validatePet = validatePet;