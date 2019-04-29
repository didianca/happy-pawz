const {User ,validateUser} = require('../models/user');
const validate= require('../middleware/validate');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const auth  = require('../middleware/auth');


//get the logged in user
router.get('/me',[auth],async (req,res)=>{
    const user = await User.findOne({_id:req.user._id}).select('-password');
    res.send(user)
});
//SIGN UP
router.post('/', validate(validateUser),async (req, res) => {
    let user = await User.findOne({email: req.body.email});
    if(user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body,['name','email','password','phone']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt);
    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token',token).send( _.pick(user,['name','email','phone']));
});


module.exports = router;