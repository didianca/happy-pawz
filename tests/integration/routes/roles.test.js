"use strict";
const request = require('supertest');
const {Role} = require('../../../api/models/role');
const {User} = require('../../../api/models/user');
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
            expect(res.status).toBe(200); //status
            expect(res.body.length).toBe(2); //complete list
            expect(res.body.some(r=>r.title ==='role1')).toBeTruthy(); //correct values
            expect(res.body.some(r=>r.title ==='role2')).toBeTruthy();//correct values
            expect(res.body[0].qualificationRate).toBeGreaterThan(res.body[1].qualificationRate); //ordering result
        })
    });
    describe('GET /:id',()=>{
        it('should return a role if valid id is passed',async ()=>{
            const role= new Role({title: 'role1'});
            await role.save();
            const res = await request(server).get('/api/roles/' + role._id);
            expect(res.status).toBe(200);//status
            expect(res.body).toHaveProperty('title',role.title); //correct value
            expect(res.body).toHaveProperty('qualificationRate',role.qualificationRate); //correct value
        });
        it('should return 404 if invalid id is passed',async ()=>{
            const res = await request(server).get('/api/roles/1');
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
});
