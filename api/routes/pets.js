//import all needed packages/modules
const express = require('express');
const router = express.Router();
const {Pet, validatePet} = require('../models/pet');
const {Owner} = require('../models/owner');
const validate = require('../middleware/validate');
const Fawn = require('fawn');
//GET all api/pets
router.get('/', async (req, res) => {
    //access db
    const pets = await Pet
        .find() //get all instances of the class
        .sort({name: 1}); //sort by name A->Z
    res.send(pets);
});
//POST new api/rentals
router.post('/',validate(validatePet), async (req, res) => {
    //check for existence in db
    const owner = await Owner.findOne({_id: req.body.ownerInfo});
    if (!owner) return res.status(400).send('Invalid owner...');
    //prevent repetition in db
    let pet = await Pet.findOne({microChip: req.body.microChip});
    if (pet) return res.status(400).send('Pet already registered.');
    //create new instance of the pet class
    pet = new Pet({
        name: req.body.name,
        microChip: req.body.microChip,
        ownerInfo: {
            _id: owner._id,
            name: owner.user.name
        },
        petRace: req.body.petRace,
        breed: req.body.breed,
        birthYear: req.body.birthYear,
        castrated: req.body.castrated,
        petColor: req.body.petColor,
        sex: req.body.sex,
        healthy: req.body.healthy
    });
    //dealing with lack of transactions in mongodb
    //see /api/routes/owners POST endpoint for more details
    try {
        new Fawn.Task()
            .save('pets', pet)
            .update('owners', {_id: owner._id}, {
                $addToSet: {pets: pet.name}
            })
            .run();
        res.send(pet);
    } catch (e) {
        res.status(500).send(e.message);
    }
});
//UPDATE existing api/rentals/:id
router.put('/:id', validate(validatePet), async (req, res) => {
    //check for existence in db
    const owner = await Owner.findOne({_id: req.body.ownerInfo});
    if (!owner) return res.status(400).send('Invalid owner...');
    //query db based on params and update with info in body of req
    const pet = await Pet.findOneAndUpdate(req.params.id, {
        name: req.body.name,
        microChip: req.body.microChip,
        ownerInfo: {
            _id: owner._id,
            name: owner.user.name,
            pets: owner.pets
        },
        petRace: req.body.petRace,
        breed: req.body.breed,
        birthYear: req.body.birthYear,
        castrated: req.body.castrated,
        petColor: req.body.petColor,
        sex: req.body.sex,
        healthy: req.body.healthy
    }, {new: true});
    //if bad params -> 404
    if (!pet) return res.status(404).send('The pet object with the given ID was not found.');
    res.send(pet);
});
//DEL existing api/rentals/:id
router.delete('/:id', async (req, res) => {
    //query db based on params and del
    const pet = await Pet.findOneAndDelete(req.params.id);
    //if bad params -> 404
    if (!pet) return res.status(404).send('The pet with the given ID was not found.');
    res.send(pet);
});
//GET by id api/rentals/:id
router.get('/:id', async (req, res) => {
    //check db for specific item by id in params
    const pet = await Pet.findOne({_id: req.params.id});
    if (!pet) return res.status(404).send('The pet with the given ID was not found');
    res.send(pet);
});
//export route to be implemented
//see /api/startup/routes
module.exports = router;