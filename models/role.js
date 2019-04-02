const Joi = require('joi');
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50
    },
    isQualified:{
        type: Boolean,
        default: false
    },
    dateRegistered: {type: Date, default: Date.now}
});
const Role = mongoose.model('Role', roleSchema);


function validateRole(role) {
    const schema = {
        title: Joi.string().min(4).max(50).required(),
        isQualified: Joi.boolean().required()
    };

    return Joi.validate(role, schema);
}
exports.roleSchema = roleSchema;
exports.Role = Role;
exports.validateRole = validateRole;