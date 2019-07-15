"use strict";
const request = require('supertest');
const {Role} = require('../../../api/models/role');
const {User} = require('../../../api/models/user');
const mongoose = require('mongoose');
let server;
/*Define the happy path
In each test we change one param that CLEARLY aligns with the name of the test*/
describe('./api/roles', () => {
    beforeEach(() => {
        server = require('../../../index');
    });
    afterEach(async () => {
        server.close();
        await Role.deleteMany({});
    });
    describe('GET /', () => {
        it('should return all roles', async () => {
            await Role.collection.insertMany([
                {title: 'role1',qualificationRate:1},
                {title: 'role2',qualificationRate: 2}
            ]);
            const res = await request(server).get('/api/roles');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(role=>role.title ==='role1')).toBeTruthy();
            expect(res.body.some(role=>role.title ==='role2')).toBeTruthy();
            expect(res.body[0].qualificationRate).toBeGreaterThan(res.body[1].qualificationRate); //ordering result
        });
    });
    describe('GET /:id',()=>{
        it('should return a role if valid id is passed',async ()=>{
            const role= new Role({title: 'role1'});
            await role.save();
            const res = await request(server).get('/api/roles/' + role._id);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('title',role.title);
            expect(res.body).toHaveProperty('qualificationRate',role.qualificationRate); //correct value
        });
        it('should return 404 if invalid id is passed',async ()=>{
            const res = await request(server).get('/api/roles/1');
            expect(res.status).toBe(404);
        });
        it('should return 404 if no role with the given id exists',async ()=>{
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get(`/api/roles/${id}`);
            expect(res.status).toBe(404);
        });
    });
    describe('POST',()=>{
        let token;
        let title;
        const exec= async ()=>{
            return await request(server)
                .post('/api/roles')
                .set('x-auth-token',token)
                .send({title});
        };
        beforeEach(()=>{
            token = new User({isAdmin:true}).generateAuthToken();
            title = 'role1';
        });
        it('should save the role if it is valid',async ()=>{
        await exec();
        const role = await Role.findOne({title:'role1'});
        expect(role).not.toBeNull();
    });
        it('should return the role if it is valid',async ()=>{
            const res = await exec();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title','role1');
            expect(res.body).toHaveProperty('qualificationRate');
        });
        it('should return 401 if client is not logged in',async ()=>{
            token='';
            const res = await exec();
          expect(res.status).toBe(401);
        });
        it('should return 403 if client is not authorized',async ()=>{
           token = new User().generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        });
        it('should return 400 if same title already exists',async ()=>{
            const role = new Role({title:'role1'});
            await role.save();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if title is less than 4 characters',async ()=>{
            title= '123';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if title is more than 50 characters',async ()=>{
            title = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });
    });
    describe('PUT /:id',()=>{
        let token;
        let newTitle;
        let role;
        let id;
        const exec= async ()=>{
            return await request(server)
                .put(`/api/roles/${id}`)
                .set('x-auth-token',token)
                .send({title:newTitle})
        };
        beforeEach(async ()=>{
            // Before each test we need to create a role and
            // put it in the database.
            role = new Role({ title: 'role1' });
            await role.save();
            //set a token with admin privileges
            token = new User({isAdmin:true}).generateAuthToken();
            id=role._id;
            newTitle='newTitle';
        });
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 403 if client is not authorized', async () => {
            token = token = new User({isAdmin:false}).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        });
        it('should return 400 if title is less than 4 characters', async () => {
            newTitle = '123';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if title is more than 50 characters', async () => {
            newTitle = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 404 if id is invalid', async () => {
            id = 1;
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should return 404 if title with the given id was not found', async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should update the role if input is valid', async () => {
            await exec();
            const updatedRole = await Role.findOne({_id:role._id});
            expect(updatedRole.title).toBe(newTitle);
        });
        it('should return the updated role if it is valid', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title', newTitle);
        });
    });
    describe('DELETE /:id',()=>{
        let token;
        let role;
        let id;
        const exec = async () => {
            return await request(server)
                .delete(`/api/roles/${id}`)
                .set('x-auth-token', token)
                .send();
        };
        beforeEach(async () => {
            // Before each test we need to create a role and
            // put it in the database.
            role = new Role({ title: 'role1' });
            await role.save();
            id = role._id;
            token = new User({ isAdmin: true }).generateAuthToken();
        });
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 403 if the user is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        });
        it('should return 404 if id is invalid', async () => {
            id = 1;
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should return 404 if no role with the given id was found', async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should delete the role if input is valid', async () => {
            await exec();
            const roleInDb = await Role.findOneAndDelete({_id:id});
            expect(roleInDb).toBeNull();
        });
        it('should return the removed role', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('_id', role._id.toHexString());
            expect(res.body).toHaveProperty('title', role.title);
            expect(res.body).toHaveProperty('qualificationRate', role.qualificationRate);
        });
    });

});
