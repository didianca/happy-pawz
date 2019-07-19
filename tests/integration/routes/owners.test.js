"use strict";
const request = require('supertest');
const {User} = require('../../../api/models/user');
const {Owner} = require('../../../api/models/owner');
const mongoose = require('mongoose');
let server;
describe('/api/owners route', () => {
    beforeEach(() => {
        server = require('../../../index');
    });
    afterEach(async () => {
        server.close();
        await User.deleteMany({});
        await Owner.deleteMany({});
    });
    describe('GET',()=>{
        it('should return all owners',async ()=>{
           const token = new User().generateAuthToken();
           await Owner.collection.insertMany([
               {userId:'12345',address:'30 Findlay St, Cincinnati, OH'},
               {userId:'12345',address:'31 Findlay St, Cincinnati, OH'}
           ]);
            const res = await request(server)
                .get('/api/owners')
                .set('x-auth-token',token);
            expect(res.status).toBe(200);
            expect(res.body).not.toBeNull();
            expect(res.body).toHaveLength(2);
        });
    });
    describe('GET /:id',()=>{
        it('return 401 if no authentication is provided', async () => {
           const token = '';
           const owner = new Owner({user:'user',address:'30 Findlay St, Cincinnati, OH'});
           await owner.save();
           const id = owner._id;
           const res = await request(server)
               .get(`/api/owners/${id}`)
               .set('x-auth-token',token);
           expect(res.status).toBe(401);
        });
        it('should return 404 if invalid id is passed',async ()=>{
            const token = new User().generateAuthToken();
            const owner = new Owner({user:'user',address:'30 Findlay St, Cincinnati, OH'});
            await owner.save();
            const id ='1';
            const res = await request(server)
                .get(`/api/owners/${id}`)
                .set('x-auth-token',token);
            expect(res.status).toBe(404);
        });
        it('should return 404 if no owner with the given id was found',async ()=>{
            const token = new User().generateAuthToken();
            const owner = new Owner({user:'user',address:'30 Findlay St, Cincinnati, OH'});
            await owner.save();
            const id = new mongoose.Types.ObjectId().toHexString();
            const res = await request(server)
                .get(`/api/owners/${id}`)
                .set('x-auth-token',token);
            expect(res.status).toBe(404);
        });
        it('should return the owner if valid id is passed',async ()=>{
            const token = new User().generateAuthToken();
            const owner = new Owner({user:'user',address:'30 Findlay St, Cincinnati, OH'});
            await owner.save();
            const id = owner._id;
            const res = await request(server)
                .get(`/api/owners/${id}`)
                .set('x-auth-token',token);
           expect(res.status).toBe(200)
        });

    });
});