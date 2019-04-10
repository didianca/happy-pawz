const Joi = require('joi');
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50,
        unique:true
    },
    qualificationRate:{
        type: Number,
        default: 0
    },
    dateRegistered: {type: Date, default: Date.now}
});


roleSchema.methods.setQualificationRate = function () {
    if(this.title ==='doctor') return this.qualificationRate = 50;
    if(this.title ==='lawyer') return this.qualificationRate = 50;
    if(this.title==='accountant') return this.qualificationRate = 25;
    if(this.title==='medical assistant') return this.qualificationRate = 25;
    return this.qualificationRate
};

const Role = mongoose.model('Role', roleSchema);

function validateRole(role) {
    const schema = {
        title: Joi.string().min(4).max(50).required()
    };

    return Joi.validate(role, schema);
}
exports.roleSchema = roleSchema;
exports.Role = Role;
exports.validateRole = validateRole;