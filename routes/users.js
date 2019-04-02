const {User ,validateUser} = require('../models/user');
const validate= require('../middleware/validate');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');

//SIGN UP
router.post('/', validate(validateUser),async (req, res) => {
    let user = await User.findOne({email: req.body.email});
    if(user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body,['name','email','password','phone','pet']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt);
    await user.save();

    res.send( _.pick(user,['_id','name','email','phone','pet']));
});

module.exports = router;