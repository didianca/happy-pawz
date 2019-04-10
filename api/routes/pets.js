const express = require('express');
const router = express.Router();
const {Pet, validatePet} = require('../models/pet');
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
router.post('/', validate(validatePet), async (req, res) => {
    const owner = await Owner.findOne({_id: req.body.ownerInfo});
    if (!owner) return res.status(400).send('Invalid owner...');

    let pet = await Pet.findOne({microChip: req.body.microChip});
    if (pet) return res.status(400).send('Pet already registered.');

    pet = new Pet({
        name: req.body.name,
        microChip: req.body.microChip,
        ownerInfo: {
            _id: owner._id,
            name: owner.user.name
        },
        petRace: req.body.petRace,
        breed: req.body.breed,
        age: req.body.age,
        castrated: req.body.castrated,
        petColor: req.body.petColor,
        sex: req.body.sex,
        healthy: req.body.healthy
    });

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

//PUT existing
router.put('/:id', validate(validatePet), async (req, res) => {
    const owner = await Owner.findOne({_id: req.body.ownerInfo});
    if (!owner) return res.status(400).send('Invalid owner...');

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
        age: req.body.age,
        castrated: req.body.castrated,
        petColor: req.body.petColor,
        sex: req.body.sex,
        healthy: req.body.healthy
    }, {new: true});
    if (!pet) return res.status(404).send('The pet object with the given ID was not found.');

    res.send(pet);
});

//DEL existing
router.delete('/:id', async (req, res) => {
    const pet = await Pet.findOneAndDelete(req.params.id);
    if (!pet) return res.status(404).send('The pet with the given ID was not found.');
    res.send(pet);
});

//GET by id
router.get('/:id', async (req, res) => {
    const pet = await Pet.findOne({_id: req.params.id});
    if (!pet) return res.status(404).send('The pet with the given ID was not found');
    res.send(pet);
});


module.exports = router;