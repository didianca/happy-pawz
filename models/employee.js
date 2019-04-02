const Joi = require('joi');
const mongoose = require('mongoose');
const {roleSchema} = require('./role');


const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    role: {
        type: roleSchema,
        required: true
    },
    phone: {
        type: String,
        minlength: 5,
        maxlength: 50,
        required: true
    },
    salary: {
        type: Number,
        required: true,
        min: 3000
    },
    qualificationRate: {
        type: Number,
        required: true,
        min: 0,
        max: 50 //0% for non-qualified, 25% for accountants and 50% for docs
    },
    dateRegistered: {type: Date, default: Date.now}
});
const Employee = mongoose.model('Employee', employeeSchema);


function validateEmployee(employee) {
    const schema = {
        name: Joi.string().min(5).max(255).required(),
        roleId: Joi.objectId().required(),
        phone: Joi.string().min(5).max(50).required(),
        salary: Joi.number().min(3000).required(),
        qualificationRate: Joi.number().min(0).required()
    };
    return Joi.validate(employee, schema);
}

exports.employeeSchema = employeeSchema;
exports.Employee = Employee;
exports.validateEmployee = validateEmployee;