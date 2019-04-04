const express= require('express');
const router= express.Router();
const {Pet,validatePet}=require('../models/pet');
const {Owner} = require('../models/owner');
const validate = require('../middleware/validate');
const Fawn = require('fawn');


//GET all
router.get('/', async (req, res) => {
    const pets = await Pet
        .find()
        .sort({name: 1});
    res.send(pets);
});

//POST new
router.post('/',validate(validatePet), async (req, res) => {
    const owner = await Owner.findOne({_id : req.body.ownerInfo});
    if(!owner) return res.status(400).send('Invalid user...');

    if(req.body.name===owner.pets) return res.status(400).send('Pet already registered.');

        const pet = new Pet({
        name: req.body.name,
        ownerInfo:{
            _id: owner._id,
            name: owner.userName.name,
            pets:owner.pets
        },
        petRace:req.body.petRace,
        breed:req.body.breed,
        age:req.body.age,
        castrated:req.body.castrated,
        petColor:req.body.petColor,
        sex:req.body.sex,
        healthy:req.body.healthy
    });


    try {
        new Fawn.Task()
            .save('pets', pet)
            .update('owners', {_id: owner._id}, {
                $push: {pets: pet.name}
            })
            .run();
        res.send(pet);
    } catch (e) {
        res.status(500).send('Something went wrong...');
    }

});




module.exports =router;