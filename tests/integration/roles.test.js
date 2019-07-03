"use strict";
const request = require('supertest');
const {Role} = require('../../api/models/role');
let server;

describe('./api/roles', () => {
    beforeEach(() => {
        server = require('../../index');
    });
    afterEach(async () => {
        server.close();
        await Role.remove({});
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
            const role= new Role({title: 'role1',qualificationRate:1});
            await role.save();
            const res = await request(server).get('/api/roles/' + role._id);
            expect(res.status).toBe(200);//status
            expect(res.body).toHaveProperty('title',role.title); //correct value
            expect(res.body).toHaveProperty('qualificationRate',role.qualificationRate); //correct value
        })
    })
});
