//import all needed packages/modules
const validateObjectId = require('../middleware/validateObjectId');
const express = require('express');
const router = express.Router();
const {Role, validateRole} = require('../models/role');
const validate = require('../middleware/validate');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
//GET all /api/roles
router.get('/', async (req, res) => {
    //get from db(find all and exclude qualification rate)
    const roles = await Role.find().sort({qualificationRate:-1});
    res.send(roles);
});
//POST new  api/roles
router.post('/',[auth,admin,validate(validateRole)],async (req, res) => {
    //check db for existence
    let role= await Role.findOne({title:req.body.title});
    if (role) return res.status(400).send('Role already registered.');
    //create new instance of the role class
     role = new Role({title: req.body.title});
    //set qualification rate used later to set salary per person
     role.setQualificationRate();
    //save changes
     await role.save();
    res.send(role);
});
//UPDATE existing api/roles/:id
router.put('/:id',[validateObjectId,auth,admin,validate(validateRole)],async(req,res)=>{
    //check for existence and update
     const role = await Role.findOneAndUpdate({_id:req.params.id},{    /*<---- .findOneAndUpdate() method*/
        title:req.body.title                                            /*queries the db and saves*/
    },{new:true});                                                     /*the changes right away*/
    //if role doesn't exist ->400
    if(!role) return res.status(404).send('No role with the give ID found.');
    role.setQualificationRate();
    await role.save();
    res.send(role)
});
//DEL existing api/roles/:id
router.delete('/:id' ,[validateObjectId,auth,admin],async (req, res) => {
    //find in db, delete it, save changes
    const role = await Role.findOneAndDelete({_id:req.params.id});
    //if non existent let user know
    if (!role) return res.status(404).send('The role with the given ID was not found.');
    res.send(role);
});
//GET one api/roles/:id
router.get('/:id',validateObjectId,async (req, res) => {
    //find in db and return it
    const role = await Role.findOne({_id:req.params.id});
    //if non existent let user know
    if (!role) return res.status(404).send('The role with the given ID was not found');
    res.send(role);
});
//export route to be implemented
//see /api/startup/routes
module.exports = router;
