//import all needed packages/modules
const validate= require('../middleware/validate');
const{User}=require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');

//Login
router.post('/', validate(validateInput),async (req, res) => {
    /* EITHER IF IT IS AN EMAIL OR A PASSWORD PROBLEM,
    THE USER SHOULD BE GIVEN A VAGUE RESPONSE SUCH AS "invalid e-mail or password."
    SO THEY CAN NOT CHEAT IT*/
    //check for email && pass -->> if valid => authorize through auth-token
//FIRST: authenticate
    //check for email
    let user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Invalid e-mail or password.');
    //check for pass
    const validPassword = await bcrypt.compare(req.body.password,user.password);
    if(!validPassword) return res.status(400).send('Invalid e-mail or password.');
//SECOND:authorize
    //generate token which provides authorization
    const token =  user.generateAuthToken();
    res.send(token);
});
//validate user input through Joi npm package
//different than the User validation method because this one requires just email and pass so phone number and name is redundant
//this function gets some input and compares it to the db rather than re-post a new user there for it needs a diff validation
function validateInput(req) {
    const schema = {
        email:Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    };
    return Joi.validate(req, schema);
}
//export route to be implemented
//see /api/startup/routes
module.exports = router;