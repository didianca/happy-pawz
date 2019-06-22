//import all needed packages/modules
const Joi = require('joi');
const mongoose = require('mongoose');
//create object schema
const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    role: {//get role by id
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
    salary: { //method to calculate based on qualification rate
        type: Number,
        required: true,
        default:30000
    },
    dateRegistered: {type: Date, default: Date.now}//default
});
//create setSalary method to automatically set a salary based on the role
//see roles for more details
employeeSchema.methods.setSalary=function () {
  const salaryDiff = (this.role.qualificationRate/100) * this.salary; //%
    this.salary = this.salary + salaryDiff //add  % to minimum salary
};
//create this object based on the schema
const Employee = mongoose.model('Employee', employeeSchema);
//validate user input with joi npm package
function validateEmployee(employee) {
    const schema = {
        name: Joi.string().min(5).max(255).required(),
        roleId: Joi.objectId().required(),
        phone: Joi.string().min(5).max(50).required()
    };
    return Joi.validate(employee, schema);
}
//export schema for creating new instances
//export Object for accessing instances in db
//exporting validating function
exports.employeeSchema = employeeSchema;
exports.Employee = Employee;
exports.validateEmployee = validateEmployee;