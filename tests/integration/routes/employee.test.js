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
            expect(res.body).toHaveProperty('name',employee.name)
        });
        it('should return 401 if no authorization is provided',async ()=>{
            const employee = new Employee({name: 'name1', role: new Role({title: 'role1'}), phone: '12345'});
            await employee.save();
            const id = employee._id;
            const res = await request(server).get(`/api/employees/${id}`);
            expect(res.status).toBe(401);
        })
    });

});