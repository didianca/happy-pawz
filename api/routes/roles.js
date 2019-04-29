const express = require('express');
const router = express.Router();
const {Role, validateRole} = require('../models/role');
const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const auth  = require('../middleware/auth');
const admin  = require('../middleware/admin');

//GET all
router.get('/', async (req, res) => {
    const roles = await Role.find().sort({qualificationRate:-1});
    res.send(roles);
});
//POST new
router.post('/',[auth,admin,validate(validateRole)],async (req, res) => {
    let role= await Role.findOne({title:req.body.title});
    if (role) return res.status(400).send(`Role \"${req.body.title}\" already registered.`);

     role = new Role({title: req.body.title});

     role.setQualificationRate();
    await role.save();

    res.send(role);
});
//UPDATE existing
router.put('/:id',[auth,admin,validate(validateRole)],async(req,res)=>{
     const role = await Role.findOneAndUpdate({_id:req.params.id},{
        title:req.body.title
    },{new:true});
    role.setQualificationRate();

    if(!role) res.status(400).send('No role with the give ID found.');
    res.send(role)
});
//DEL existing
router.delete('/:id',[auth,admin] ,async (req, res) => {
    const role = await Role.findOneAndDelete({_id:req.params.id});
    if (!role) return res.status(404).send('The role with the given ID was not found.');

    res.send(role);
});
//GET one
router.get('/:id', validateObjectId,async (req, res) => {
    const role = await Role.findOne({_id:req.params.id});
    if (!role) return res.status(404).send('The role with the given ID was not found');
    res.send(role);
});

module.exports = router;
