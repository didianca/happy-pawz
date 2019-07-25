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
                {user: userOne, address: '30 Findlay St, Cincinnati, OH', pets: []},
                {user: userTwo, address: '31 Findlay St, Cincinnati, OH', pets: []}
            ]);
            const token = new User().generateAuthToken();
            const res = await request(server)
                .get('/api/owners')
                .set('x-auth-token', token);
            expect(res.status).toBe(200);
            expect(res.body).not.toBeNull();
            expect(res.body.some(owner => owner.user.name === 'name1')).toBeTruthy();
            expect(res.body.some(owner => owner.user.email === 'email1@email.com')).toBeTruthy();
            expect(res.body.some(owner => owner.address === '30 Findlay St, Cincinnati, OH')).toBeTruthy();
            expect(res.body.some(owner => owner.user.name === 'name2')).toBeTruthy();
            expect(res.body.some(owner => owner.user.email === 'email2@email.com')).toBeTruthy();
            expect(res.body.some(owner => owner.address === '31 Findlay St, Cincinnati, OH')).toBeTruthy();

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
    describe('POST /', () => {
        let token;
        let user;
        let address;
        const exec = async () => {
            return await request(server)
                .post('/api/owners')
                .set('x-auth-token', token)
                .send({user: user._id, address});
        };
        beforeEach(async () => {
            user = new User({
                name: 'name',
                phone: '12345',
                email: 'email@email.com',
                password: 'password'
            });
            await user.save();
            token = user.generateAuthToken();
            address = '30 Findlay St, Cincinnati, OH';
        });
        it('should return 401 is client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 400 if owner already registered', async () => {
            const owner = new Owner({user, address});
            await owner.save();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if user is missing', async () => {
            user = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if user is not a valid object', async () => {
            user = 'string';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if address is missing', async () => {
            address = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if address is less than 10 characters long', async () => {
            address = '12345';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if address is longer than 255 characters long', async () => {
            address = new Array('257').join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if address is not of type string', async () => {
            address = 1234567890;
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if user doesn\'t exist', async () => {
            user = {_id: mongoose.Types.ObjectId()};
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if no user with the given id exists', async () => {
            user = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if  user is already owner', async () => {
            await User.findOneAndUpdate({_id: user._id}, {$set: {isOwner: true}});
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return the new owner if it is valid', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).not.toBeNull();
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('name', user.name);
            expect(res.body.user).toHaveProperty('phone', user.phone);
            expect(res.body).toHaveProperty('address', address);
            expect(res.body).toHaveProperty('pets', []);

        })
    });
    describe('PUT /:id', () => {
        let token;
        let newAddress;
        let newUser;
        let owner;
        let id;
        const exec = async () => {
            return await request(server)
                .put(`/api/owners/${id}`)
                .set('x-auth-token', token)
                .send({user: newUser._id, address: newAddress})
        };
        beforeEach(async () => {
            newUser = new User({
                name: 'newName',
                phone: 'newPhone',
                email: 'newEmail@email.com',
                password: 'newPassword'
            });
            await newUser.save();
            const user = new User({
                name: 'oldName',
                phone: 'oldPhone',
                email: 'oldEmail@email.com',
                password: 'oldPassword'
            });
            await user.save();
            owner = new Owner({
                user: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone
                },
                address: '115 Winding Way, Covington, KY'
            });
            await owner.save();
            token = user.generateAuthToken();
            id = owner._id;
            newAddress = '30 Findlay St,Cincinnati, OH'
        });
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 404 if id is invalid', async () => {
            id = '1';
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should return 404 if no owner with the given id was found', async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should return 400 if no user with the given id was found', async () => {
            newUser = {_id: mongoose.Types.ObjectId()};
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if the userId is not a valid objectId', async () => {
            newUser = {_id: '1'};
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if address is less than 10 characters long', async () => {
            newAddress = '123456789';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if address is longer than 255 characters', async () => {
            newAddress = new Array(257).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if address is missing', async () => {
            newAddress = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if address is not of type string', async () => {
            newAddress = 1;
            const res = await exec();
            expect(res.status).toBe(400)
        });
        it('should return the updated owner', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('address', newAddress);
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('name', 'newName');
        });
    });
    describe('DELETE /', () => {
        let token;
        let owner;
        let id;
        const exec = async () => {
            return await request(server)
                .delete(`/api/owners/${id}`)
                .set('x-auth-token', token)
                .send();
        };
        beforeEach(async () => {
            const user = new User({
                name: 'oldName',
                phone: 'oldPhone',
                email: 'oldEmail@email.com',
                password: 'oldPassword'
            });
            await user.save();
            owner = new Owner({
                user: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone
                },
                address: '115 Winding Way, Covington, KY'
            });
            await owner.save();
            token = user.generateAuthToken();
            id = owner._id;
        });
        it('should return 401 if token is missing', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 404 if id is invalid', async () => {
            id = '1';
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should 404 if no owner with the given id was found', async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should delete the owner', async () => {
            await exec();
            const ownerInDb = await Owner.findOne({_id: id});
            expect(ownerInDb).toBeNull();
        });
    });
});