//import all needed packages/modules
const express = require('express');
const router = express.Router();
const {Role, validateRole} = require('../models/role');
const validate = require('../middleware/validate');
//GET all /api/roles
router.get('/', async (req, res) => {
    //get from db(find all and exclude qualification rate)
    const roles = await Role.find().sort({qualificationRate:-1});
    res.send(roles);
});
//POST new  api/roles
router.post('/',[validate(validateRole)],async (req, res) => {
    //check db for existence
    let role= await Role.findOne({title:req.body.title});
    if (role) return res.status(400).send(`Role \"${req.body.title}\" already registered.`);
    //create new instance of the role class
     role = new Role({title: req.body.title});
    //set qualification rate used later to set salary per person
     role.setQualificationRate();
    //save changes
     await role.save();

    res.send(role);
});
//UPDATE existing api/roles/:id
router.put('/:id',validate(validateRole),async(req,res)=>{
    //check for existence and update
     const role = await Role.findOneAndUpdate({_id:req.params.id},{    /*<---- .findOneAndUpdate() method*/
        title:req.body.title                                           /*queries the db and saves*/
    },{new:true});                                                     /*the changes right away*/
     //set qualification rate
    role.setQualificationRate();
    //if role doesn't exist ->400
    if(!role) res.status(400).send('No role with the give ID found.');
    res.send(role)
});
//DEL existing api/roles/:id
router.delete('/:id' ,async (req, res) => {
    //find in db, delete it, save changes
    const role = await Role.findOneAndDelete({_id:req.params.id});
    //if non existent let user know
    if (!role) return res.status(404).send('The role with the given ID was not found.');
    res.send(role);
});
//GET one api/roles/:id
router.get('/:id',async (req, res) => {
    //find in db and return it
    const role = await Role.findOne({_id:req.params.id});
    //if non existent let user know
    if (!role) return res.status(404).send('The role with the given ID was not found');
    res.send(role);
});
//export route to be implemented
//see /api/startup/routes
module.exports = router;
