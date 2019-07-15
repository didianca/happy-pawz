"use strict";
const request = require('supertest');
const {Employee} = require('../../../api/models/employee');
const {Role} = require('../../../api/models/role');
const {User} = require('../../../api/models/user');
const mongoose = require('mongoose');
let server;
describe('/api/employees route',()=>{
   beforeEach(()=>{server=require('../../../index')});
   afterEach(async ()=>{
       server.close();
       await Role.deleteMany({});
       await Employee.deleteMany({});
   });
    describe('GET /',()=>{
        it('should return all employees',async ()=>{
            await Employee.collection.insertMany([
                {name:'name1',role:'role1',phone:'12345',salary:'1'},
                {name:'name2',role:'rol2',phone: '12345',salary:'2'}
            ]);
            const res = await request(server).get('/api/employees');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(employee=>employee.name ==='name1')).toBeTruthy();
            expect(res.body.some(employee=>employee.name ==='name2')).toBeTruthy();
            expect(res.body[0]).not.toHaveProperty('salary');
        })
    });

});