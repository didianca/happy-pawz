//import all needed packages/modules
const Joi = require('joi');
const mongoose = require('mongoose');
const config = require('config');
const jwt=require('jsonwebtoken');
//create object schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        maxlength: 50,
        unique:true
    },
    password: {
        type: String,
        required: true,
        min: 5,
        max: 1024
        //TODO:  !!!   joi-password-complexity   !!!
    },
    isAdmin: {
        type: Boolean,
        default: false
    },//default
    isOwner: {
        type: Boolean,
        default: false
    },//automatically set
    phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    date: {type: Date, default: Date.now} //default
});
//generating auth token for authentication Login/SignUp
//see /api/routes/ath & /api/routes/users
userSchema.methods.generateAuthToken = function () {
    return jwt.sign({_id: this._id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
};
//create this object based on the schema
const User = mongoose.model('User', userSchema);
//validate user input with joi npm package
function validateUser(user) {
    const schema = {
        name: Joi.string().min(4).max(50).required(),
        email: Joi.string().min(5).max(50).required().email(),
        password: Joi.string().min(5).max(50).required(),
        phone: Joi.string().min(5).max(50).required()
    };
    return Joi.validate(user, schema);
}
//export Object for accessing instances in db
//exporting validating function
exports.User = User;
exports.userSchema = userSchema;
exports.validateUser = validateUser;
