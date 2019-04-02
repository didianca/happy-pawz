const express = require('express');
const router = express.Router();
const {Role, validateRole} = require('../models/role');
const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');

//GET all
router.get('/', async (req, res) => {
    const roles = await Role.find().sort('title');
    res.send(roles);
});
//POST new
router.post('/',validate(validateRole),async (req, res) => {
    const role = new Role({title: req.body.title, isQualified: req.body.isQualified});
    await role.save();

    res.send(role);
});

//UPDATE existing
router.put('/:id',validate(validateRole), async (req, res) => {
    const role = await Role.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        isQualified: req.body.isQualified
    }, {new: true});
    if (!role) return res.status(404).send('The role with the given ID was not found.');

    res.send(role);
});

//DEL existing
router.delete('/:id', async (req, res) => {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).send('The role with the given ID was not found.');

    res.send(role);
});

//GET one
router.get('/:id', validateObjectId,async (req, res) => {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).send('The role with the given ID was not found');
    res.send(role);
});

module.exports = router;
