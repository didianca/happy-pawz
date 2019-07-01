//import all needed packages/modules
const Joi = require('joi');
const mongoose = require('mongoose');
//create object schema
const roleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50,
        unique:true
    },
    qualificationRate:{//method to calculate
        type: Number,
        default: 0
    },
    dateRegistered: {type: Date, default: Date.now}//default
});
//setting qualification rate which is multiplied later to add to the base salary based on the employees role
roleSchema.methods.setQualificationRate = function () {
    switch (this.title) {
        case 'veterinarian':
        case 'lawyer':
            this.qualificationRate = 50;
            break;
        case 'accountant':
        case 'medical assistant':
            this.qualificationRate = 25;
            break;
        default:
            this.qualificationRate = 0;
    }
    return this.qualificationRate

};
//create this object based on the schema
const Role = mongoose.model('Role', roleSchema);
//validate user input with joi npm package
function validateRole(role) {
    const schema = {
        title: Joi.string().min(4).max(50).required()
    };
    return Joi.validate(role, schema);
}
//export schema for creating new instances
//export Object for accessing instances in db
//exporting validating function
exports.roleSchema = roleSchema;
exports.Role = Role;
exports.validateRole = validateRole;