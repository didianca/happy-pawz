const validate= require('../middleware/validate');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');


//Login
router.post('/login', validate(validateInput),async (req, res) => {
    let user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Invalid e-mail or password.');
    /* EITHER IF IT IS AN EMAIL OR A PASSWORD PROBLEM, THE USER SHOULD BE GIVEN A VAGUE RESPOND SUCH AS "invalid e-mail or password."*/
    const validPassword = await bcrypt.compare(req.body.password,user.password);
    if(!validPassword) return res.status(400).send('Invalid e-mail or password.');
    const token =  user.generateAuthToken();
    res.send(token);
});

function validateInput(req) {
    const schema = {
        email:Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    };
    return Joi.validate(req, schema);
}



module.exports = router;