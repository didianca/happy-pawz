const Joi = require('joi');
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    ownerInfo: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 4,
                maxlength: 50
            },
            pets: {
                type: Array,
                required: true,
                min: 1
            }
        })
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
        required: true
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
        required: true
    },
    isAccomodated: {
        type: Boolean,
        default: false
    },
    date: {type: Date, default: Date.now}
});
const Pet = mongoose.model('Pet', petSchema);

function validatePet(pet) {
    const schema = {
        name: Joi.string().min(1).max(50).required(),
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