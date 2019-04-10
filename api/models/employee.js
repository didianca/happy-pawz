const Joi = require('joi');
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    role: {
        type: new mongoose.Schema({
            title:{
                type: String,
                required: true,
                minlength: 4,
                maxlength: 50
            },
            qualificationRate:{
                type: Number,
                default: 0
            }
        }),
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
        default:30000
    },
    dateRegistered: {type: Date, default: Date.now}
});

employeeSchema.methods.setSalary=function () {
  const salaryDiff = (this.role.qualificationRate/100) * this.salary;
    this.salary = this.salary + salaryDiff
};

const Employee = mongoose.model('Employee', employeeSchema);

function validateEmployee(employee) {
    const schema = {
        name: Joi.string().min(5).max(255).required(),
        roleId: Joi.objectId().required(),
        phone: Joi.string().min(5).max(50).required()
    };
    return Joi.validate(employee, schema);
}

exports.employeeSchema = employeeSchema;
exports.Employee = Employee;
exports.validateEmployee = validateEmployee;