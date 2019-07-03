//import all needed packages/modules
const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const {Employee, validateEmployee} = require('../models/employee');
const {Role} = require('../models/role');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const validateObjectId= require('../middleware/validateObjectId');
//END-POINTS:
//GET all  api/employees
router.get('/',async (req, res) => {
    //access employee list in db
    const employees = await Employee
        .find() //find them all
        .sort("-salary"); //exclude the salary when returning
    res.send(employees);
});
//POST new  api/employees
router.post('/',[auth,admin,validate(validateEmployee)]/*any middleware function will be called b4 the actual callback function*/, async (req, res) => {
    //check for existence
    const role = await Role.findOne({_id : req.body.roleId});
    if(!role) return res.status(400).send('Invalid role...');
    //employee - check for existence
    let employee = await Employee.findOne({name: req.body.name} || {phone: req.body.phone});
    if (employee) return res.status(400).send('Employee already registered');
    //create new instance of the employee class with the info provided in the body of the request
    employee= new Employee({
        name: req.body.name,
        role:{
            _id: role._id,
            title: role.title,
            qualificationRate:role.qualificationRate
        },
        phone:req.body.phone
    });
    //set salary
    role.setQualificationRate();
    employee.setSalary();
    //save new instance to db
    await employee.save();

    res.send(employee);
});
//UPDATE existing  api/employees/:id
router.put('/:id',[validateObjectId,auth,admin, validate(validateEmployee)],async (req, res) => {
    //check for existence
    const role = await Role.findOne({_id : req.body.roleId});
    if(!role) return res.status(400).send('Invalid role...');
    //query by params and update using info provided in the body of the request
    const employee=await Employee.findOneAndUpdate({_id:req.params.id}, {
            name: req.body.name,
        role:{
            _id: role._id,
            title: role.title,
            qualificationRate: role.qualificationRate
        },
        phone:req.body.phone
    }, {new: true});
    //set salary
    employee.setSalary();
    //deal with wrong params
    if (!employee) return res.status(404).send('The employee with the given ID was not found.');
    res.send(employee);
});
//DEL existing  api/employees/:id
router.delete('/:id',[validateObjectId,auth,admin] ,async (req, res) => {
    //query by params and delete
    const employee = await Employee.findOneAndDelete({_id:req.params.id});
    //if bad params -> 404
    if (!employee) return res.status(404).send('The employee with the given ID was not found.');
    res.send(employee);
});
//GET one by id  api/employees/:id
router.get('/:id',[validateObjectId,auth,admin], async (req, res) => {
    //query by params
    const employee = await Employee.findOne({_id : req.params.id});
    //if bad params -> 404
    if (!employee) return res.status(404).send('The employee with the given ID was not found');
    res.send(employee);
});
//export route to be implemented
//see /api/startup/routes
module.exports = router;
