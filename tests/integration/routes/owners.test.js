"use strict";
const request = require('supertest');
const {Owner} = require('../../../api/models/owner');
const {User} = require('../../../api/models/user');
const mongoose = require('mongoose');
let server;
describe('/api/owners route', () => {
    beforeEach(() => {
        server = require('../../../index');
    });
    afterEach(async () => {
        server.close();
        await Owner.deleteMany({});
        await User.deleteMany({});
    });
    describe('GET', () => {
        it('should return all owners', async () => {
            const userOne = {
                name: 'name1',
                phone: '12345',
                email: 'email1@email.com',
                password: 'password'
            };
            const userTwo = {
                name: 'name2',
                phone: '12345',
                email: 'email2@email.com',
                password: 'password'
            };
            await Owner.collection.insertMany([
                {user: userOne, address: '30 Findlay St, Cincinnati, OH',pets:[]},
                {user: userTwo, address: '31 Findlay St, Cincinnati, OH',pets:[]}
            ]);
            const token = new User({isAdmin:true}).generateAuthToken();
            const res = await request(server)
                .get('/api/owners')
                .set('x-auth-token', token);
            expect(res.status).toBe(200);
            expect(res.body).not.toBeNull();
            expect(res.body).toHaveLength(2);
            expect(res.body[0]).toHaveProperty('user');
            expect(res.body[0]).toHaveProperty('pets');
            expect(res.body[0]).toHaveProperty('address','30 Findlay St, Cincinnati, OH');
            expect(res.body[1]).toHaveProperty('user');
            expect(res.body[1]).toHaveProperty('pets');
            expect(res.body[1]).toHaveProperty('address','31 Findlay St, Cincinnati, OH');
        });
    });
    describe('GET /:id', () => {
        it('return 401 if no authentication is provided', async () => {
            const token = '';
            const user = {
                name: 'name',
                phone: '12345',
                email: 'email@email.com',
                password: 'password'
            };
            const owner = new Owner({
                user: user, address: '30 Findlay St, Cincinnati, OH'
            });
            await owner.save();
            const id = owner._id;
            const res = await request(server)
                .get(`/api/owners/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(401);
        });
        it('should return 404 if invalid id is passed', async () => {
            const token = new User().generateAuthToken();
            const user = {
                name: 'name',
                phone: '12345',
                email: 'email@email.com',
                password: 'password'
            };
            const owner = new Owner({user, address: '30 Findlay St, Cincinnati, OH'});
            await owner.save();
            const id = '1';
            const res = await request(server)
                .get(`/api/owners/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(404);
        });
        it('should return 404 if no owner with the given id was found', async () => {
            const token = new User().generateAuthToken();
            const user = {
                name: 'name',
                phone: '12345',
                email: 'email@email.com',
                password: 'password'
            };
            const owner = new Owner({user, address: '30 Findlay St, Cincinnati, OH'});
            await owner.save();
            const id = new mongoose.Types.ObjectId().toHexString();
            const res = await request(server)
                .get(`/api/owners/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(404);
        });
        it('should return the owner if valid id is passed', async () => {
            const token = new User().generateAuthToken();
            const user = {
                name: 'name',
                phone: '12345',
                email: 'email@email.com',
                password: 'password'
            };
            const owner = new Owner({user, address: '30 Findlay St, Cincinnati, OH'});
            await owner.save();
            const id = owner._id;
            const res = await request(server)
                .get(`/api/owners/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(200)
        });
    });
});