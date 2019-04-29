const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const auth  = require('../middleware/auth');
const admin  = require('../middleware/admin');

const {Employee, validateEmployee} = require('../models/employee');
const {Role} = require('../models/role');


//GET all
router.get('/', async (req, res) => {
    const employees = await Employee
        .find()
        .sort("-salary");
    res.send(employees);
});

//POST new
router.post('/',[admin,auth,validate(validateEmployee)], async (req, res) => {
    const role = await Role.findOne({_id : req.body.roleId});
    if(!role) return res.status(400).send('Invalid role...');

    const employee = new Employee({
        name: req.body.name,
        role:{
            _id: role._id,
            title: role.title,
            qualificationRate:role.qualificationRate
        },
        phone:req.body.phone
    });
    employee.setSalary();
    await employee.save();

    res.send(employee);
});

//UPDATE existing
router.put('/:id', [admin,auth,validate(validateEmployee)],async (req, res) => {
    const role = await Role.findOne({_id : req.body.roleId});
    if(!role) return res.status(400).send('Invalid role...');

    const employee = await Employee.findOneAndUpdate({_id:req.params.id}, {
        name: req.body.name,
        role:{
            _id: role._id,
            title: role.title,
            qualificationRate: role.qualificationRate
        },
        phone:req.body.phone
    }, {new: true});
    if (!employee) return res.status(404).send('The employee with the given ID was not found.');
    res.send(employee);
});

//DEL existing
router.delete('/:id',[admin,auth] ,async (req, res) => {
    const employee = await Employee.findOneAndUpdate({_id:req.params.id});
    if (!employee) return res.status(404).send('The employee with the given ID was not found.');
    res.send(employee);
});

//GET one
router.get('/:id', async (req, res) => {
    const employee = await Employee.findOne({_id : req.params.id});
    if (!employee) return res.status(404).send('The employee with the given ID was not found');
    res.send(employee);
});


module.exports = router;
