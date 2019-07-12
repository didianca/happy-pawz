//import all needed packages/modules
const {User ,validateUser} = require('../models/user');
const validate= require('../middleware/validate');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const auth  = require('../middleware/auth'); //authentication
//get the logged in user /api/users/me !!!ADD token in header to get proper result !!!
router.get('/me',[auth],async (req,res)=>{
    //get user from db and exclude password
    const user = await User.findOne({_id:req.user._id}).select('-password');
    res.send(user)
});
//SIGN UP /api/users
router.post('/', validate(validateUser),async (req, res) => {
    //check for duplication
    let user = await User.findOne({email: req.body.email});
    if(user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body,['name','email','password','phone']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt);

    await user.save();

    const token = user.generateAuthToken();
    //set  the auth-token in the header of the response
    //the payload of the token contains info about the object
    res.header('x-auth-token',token).send( _.pick(user,['name','email','phone']));
});
//export route to be implemented
//see /api/startup/routes
module.exports = router;