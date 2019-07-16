"use strict";
const request = require('supertest');
const {Employee} = require('../../../api/models/employee');
const {Role} = require('../../../api/models/role');
const {User} = require('../../../api/models/user');
const mongoose = require('mongoose');
let server;
describe('/api/employees route', () => {
    beforeEach(() => {
        server = require('../../../index')
    });
    afterEach(async () => {
        server.close();
        await Role.deleteMany({});
        await Employee.deleteMany({});
    });
    describe('GET /', () => {
        it('should return all employees', async () => {
            await Employee.collection.insertMany([
                {name: 'name1', role: 'role1', phone: '12345', salary: '1'},
                {name: 'name2', role: 'rol2', phone: '12345', salary: '2'}
            ]);
            const res = await request(server).get('/api/employees');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(employee => employee.name === 'name1')).toBeTruthy();
            expect(res.body.some(employee => employee.name === 'name2')).toBeTruthy();
            expect(res.body[0]).not.toHaveProperty('salary');
        })
    });
    describe('GET /:id', () => {
        it('return 404 if invalid id is passed', async () => {
            const res = await request(server).get('/api/employees/1');
            expect(res.status).toBe(404)
        });
        it('should return 404 if no employee with the given id was found', async () => {
            const id = mongoose.Types.ObjectId();
            const token = new User({isAdmin: true}).generateAuthToken();
            const res = await request(server).get(`/api/employees/${id}`).set('x-auth-token', token);
            expect(res.status).toBe(404);
        });
        it('should return the employee if valid id is passed', async () => {
            const employee = new Employee({name: 'name1', role: new Role({title: 'role1'}), phone: '12345'});
            await employee.save();
            const token = new User({isAdmin: true}).generateAuthToken();
            const res = await request(server).get('/api/employees/' + employee._id).set('x-auth-token', token);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', employee.name)
        });
        it('should return 401 if no authorization is provided', async () => {
            const employee = new Employee({name: 'name1', role: new Role({title: 'role1'}), phone: '12345'});
            await employee.save();
            const id = employee._id;
            const res = await request(server).get(`/api/employees/${id}`);
            expect(res.status).toBe(401);
        })
    });
    describe('POST', () => {
        let token;
        let name;
        let role;
        let phone;
        const exec = async () => {
            return await request(server)
                .post('/api/employees')
                .set('x-auth-token', token)
                .send({name, roleId: role._id, phone})
        };
        beforeEach(async () => {
            name = 'name1';
            role = new Role({title: 'role1'});
            role.setQualificationRate();
            await role.save();
            phone = '12345 ';
            token = new User({isAdmin: true}).generateAuthToken();
        });
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 403 is client is not authorized', async () => {
            token = new User().generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        });
        it('should return 400 if employee already registered', async () => {
            const employee = new Employee({name, role, phone});
            await employee.save();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if name is missing', async () => {
            name = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if name is less than 5 characters long', async () => {
            name = 'name';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if name is longer than 50 characters long', async () => {
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if role is missing', async () => {
            role = {_id: ''};
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if role is not a valid object', async () => {
            role = 'role';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if no role with the give id exists', async () => {
            role = {_id: mongoose.Types.ObjectId()};
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if phone is missing', async () => {
            phone = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if phone is less than 5 characters long', async () => {
            phone = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if phone is longer than 50 characters long', async () => {
            phone = new Array(52).join('1');
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should save the employee if it is valid', async () => {
            await exec();
            const employee = await Employee.findOne({name: 'name1'});
            expect(employee).not.toBeNull();
        });
    });
    describe('PUT /:id', () => {
        let token;
        let newName;
        let role;
        let newRoleId;
        let newPhone;
        let employee;
        let id;
        const exec = async () => {
            return await request(server)
                .put(`/api/employees/${id}`)
                .set('x-auth-token', token)
                .send({name: newName, roleId: newRoleId, phone: newPhone})
        };
        beforeEach(async () => {
            //insert a role for the beginning and have a second role to change it to
            role = new Role({title: 'accountant'});
            role.setQualificationRate();
            await role.save();
            const newRole = new Role({title: 'maid'});
            newRole.setQualificationRate();
            await newRole.save();
            newRoleId = newRole._id;
            //create an employee to be changed -  change these values one by one to see different paths
            employee = new Employee({
                name: 'name1',
                role: {_id: role._id, title: role.title, qualificationRate: role.qualificationRate},
                phone: '12345'
            });
            employee.setSalary();
            await employee.save();
            token = new User({isAdmin: true}).generateAuthToken();
            id = employee._id;
            //set the new values that will be given when exec will be given in the exec function
            newPhone = '23456';
            newName = 'name2';
        });
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 403 if the user is not admin', async () => {
            token = new User().generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);

        });
        it('should return 404 if id is invalid', async () => {
            id = '1';
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should return 404 if no employee with the given id was found', async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should return 400 if roleId is not a valid id', async () => {
            newRoleId = '1';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if no role with the given id was found', async () => {
            newRoleId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if name is less than 5 characters', async () => {
            newName = '1234';
            const res = await exec();
            expect(res.status).toBe(400)
        });
        it('should be 400 if name is longer than 50 characters', async () => {
            newName = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if name is missing', async () => {
            newName = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if name is not of type string', async () => {
            newName = 1;
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should be 400 if phone is not of type string', async () => {
            newPhone = 1;
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should be 400 if phone is less than 5 characters long', async () => {
            newPhone = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should be 400 if phone is longer than 50 characters long', async () => {
            newPhone = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should be 400 if phone is missing', async () => {
            newPhone = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should be 400 if salary is missing', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('salary');
        });
        it('should return the updated employee', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'name2');
            expect(res.body).toHaveProperty('role');
            expect(res.body).toHaveProperty('phone', '23456');
            expect(res.body).toHaveProperty('role.title', 'maid');
            expect(res.body).toHaveProperty('salary', 30000);
        });
    });
    describe('DELETE /:id', () => {
        let token;
        let employee;
        let id;
        const exec = async () => {
            return await request(server)
                .delete(`/api/employees/${id}`)
                .set('x-auth-token', token)
                .send();
        };
        beforeEach(async () => {
            employee = new Employee({name: 'name1', role: new Role({title: 'role'}), phone: '12345'});
            await employee.save();
            id = employee._id;
            token = new User({isAdmin: true}).generateAuthToken();
        });
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 403 if client is not authorized', async () => {
            token = new User().generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        });
        it('should return 404 if id is invalid',async ()=>{
           id='1';
           const res = await exec();
           expect(res.status).toBe(404);
        });
        it('should return 404 if no employee with the given id was found',async ()=>{
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should delete the employee if input is valid',async ()=>{
            await exec();
            const employeeInDb = await Employee.findOneAndDelete({_id:id});
            expect(employeeInDb).toBeNull();
        });
    })
});