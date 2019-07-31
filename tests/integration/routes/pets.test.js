"use strict";
const request = require('supertest');
const {Owner} = require('../../../api/models/owner');
const {Pet} = require('../../../api/models/pet');
const {User} = require('../../../api/models/user');
const mongoose = require('mongoose');
let server;
describe('/api/pets route', () => {
    beforeEach(async () => {
        server = require('../../../index');
    });
    afterEach(async () => {
        server.close();
        await Pet.deleteMany({});
        await Owner.deleteMany({});
        await User.deleteMany({});
    });
    describe('GET', () => {
        it('should return all pets', async () => {
            const owner = {
                user: 'userInfo',
                address: '30 Findlay St,Cincinnati, OH'
            };
            await Pet.collection.insertMany([
                {
                    name: 'pet1',
                    microChip: '1111111111',
                    ownerInfo: owner,
                    species: 'dog',
                    breed: 'Labrador',
                    birthYear: '2018',
                    castrated: 'true',
                    petColor: 'golden',
                    sex: 'female',
                    healthy: 'true'
                },
                {
                    name: 'pet2',
                    microChip: '2222222222',
                    ownerInfo: owner,
                    species: 'dog',
                    breed: 'Labrador',
                    birthYear: '2018',
                    castrated: 'true',
                    petColor: 'golden',
                    sex: 'female',
                    healthy: 'true'
                }
            ]);
            const token = await User({isAdmin: true}).generateAuthToken();
            const res = await request(server)
                .get('/api/pets')
                .set('x-auth-token', token);
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body.some(pet => pet.name === 'pet1')).toBeTruthy();
            expect(res.body.some(pet => pet.name === 'pet2')).toBeTruthy();
            expect(res.body.some(pet => pet.microChip === '1111111111')).toBeTruthy();
            expect(res.body.some(pet => pet.microChip === '2222222222')).toBeTruthy();
            expect(res.body[0].name).toBe('pet1');
            expect(res.body[1].name).toBe('pet2');
        });
    });
    describe('GET /:id', () => {
        let token;
        let owner;
        let pet;
        it('should return 401 if no token is provided', async () => {
            owner = {
                name: 'ownerName',
                phone: '123456',
                address: '30 Findlay St,Cincinnati, OH'
            };
            pet = new Pet({
                name: 'petById',
                microChip: '1234567890',
                ownerInfo: owner,
                species: 'dog',
                breed: 'Labrador',
                birthYear: '2018',
                castrated: 'true',
                petColor: 'golden',
                sex: 'female',
                healthy: 'true'
            });
            await pet.save();
            const id = mongoose.Types.ObjectId();
            token = '';
            const res = await request(server)
                .get(`/api/pets/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(401);
        });
        it('should return 404 if the id is invalid', async () => {
            owner = {
                name: 'ownerName',
                phone: '123456',
                address: '30 Findlay St,Cincinnati, OH'
            };
            pet = new Pet({
                name: 'petById',
                microChip: '1234567890',
                ownerInfo: owner,
                species: 'dog',
                breed: 'Labrador',
                birthYear: '2018',
                castrated: 'true',
                petColor: 'golden',
                sex: 'female',
                healthy: 'true'
            });
            await pet.save();
            token = new User({isAdmin: true}).generateAuthToken();
            const id = '1';
            const res = await request(server)
                .get(`/api/pets/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(404);
        });
        it('should return 404 if no pet with the  given id was found', async () => {
            owner = {
                name: 'ownerName',
                phone: '123456',
                address: '30 Findlay St,Cincinnati, OH'
            };
            pet = new Pet({
                name: 'petById',
                microChip: '1234567890',
                ownerInfo: owner,
                species: 'dog',
                breed: 'Labrador',
                birthYear: '2018',
                castrated: 'true',
                petColor: 'golden',
                sex: 'female',
                healthy: 'true'
            });
            await pet.save();
            token = new User({isAdmin: true}).generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const res = await request(server)
                .get(`/api/pets/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(404);
        });
        it('should return the pet', async () => {
            owner = {
                name: 'ownerName',
                phone: '123456',
                address: '30 Findlay St,Cincinnati, OH'
            };
            pet = new Pet({
                name: 'pet',
                microChip: '1234567890',
                ownerInfo: owner,
                species: 'dog',
                breed: 'Labrador',
                birthYear: '2018',
                castrated: 'true',
                petColor: 'golden',
                sex: 'female',
                healthy: 'true'
            });
            await pet.save();
            token = new User({isAdmin: true}).generateAuthToken();
            const id = pet._id;
            const res = await request(server)
                .get(`/api/pets/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'pet')
        });
    });
    describe('POST /', () => {
        let token;
        let owner;
        const exec = async () => {
            return await request(server)
                .post('/api/pets')
                .set('x-auth-token', token)
                .send({
                    name: 'pet',
                    microChip: '3333333333',
                    ownerInfo: owner._id,
                    species: 'dog',
                    breed: 'labrador',
                    birthYear: '2018',
                    castrated: 'true',
                    petColor: 'golden',
                    sex: 'female',
                    healthy: 'true'
                })
        };
        beforeEach(async () => {
            owner = new Owner({
                user: new User({name: 'userName', phone: '123456'}),
                address: '30 Findlay St,Cincinnati,OH'
            });
            await owner.save();
            token = new User({isAdmin: true}).generateAuthToken();
        });
        afterEach(async () => {
            await Pet.deleteMany({});
            await Owner.deleteMany({});
        });
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 404 if there is no owner with the given id', async () => {
            owner._id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should return 400 if the pet is already registered', async () => {
            const pet = new Pet({
                name: 'pet',
                microChip: '3333333333',
                ownerInfo: {
                    name: 'ownerName',
                    phone: '123456',
                    address: '30 Findlay St, Cincinnati, Oh'
                },
                species: 'dog',
                breed: 'Labrador',
                birthYear: '2018',
                castrated: 'true',
                petColor: 'golden',
                sex: 'female',
                healthy: 'true'
            });
            await pet.save();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should save the pet', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'pet');
        });
    });
    describe('PUT /:ID', () => {
        let token;
        let owner;
        let newMicroChip;
        let pet;
        let id;
        const exec = async () => {
            return await request(server)
                .put(`/api/pets/${id}`)
                .set('x-auth-token', token)
                .send({
                    name: pet.name,
                    microChip: newMicroChip,
                    ownerInfo: owner._id,
                    species: pet.name,
                    breed: pet.breed,
                    birthYear: '2018',
                    castrated: pet.castrated,
                    petColor: pet.petColor,
                    sex: pet.sex,
                    healthy: pet.healthy
                })
        };
        beforeEach(async () => {
            const user = new User({
                name: 'name',
                phone: '12345',
                email: 'email@email.com',
                password: 'password'
            });
            await user.save();
            token = user.generateAuthToken();
            owner = new Owner({
                user: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone
                },
                address: '115 Winding Way, Covington, KY'
            });
            await owner.save();
            newMicroChip = '4444444445';
            pet = new Pet({
                name: 'pet',
                microChip: '4444444444',
                ownerInfo: {
                    _id: owner._id,
                    name: owner.user.name,
                    pets: owner.pets
                },
                species: 'dog',
                breed: 'labrador',
                birthYear: '2018',
                castrated: 'true',
                petColor: 'golden',
                sex: 'female',
                healthy: 'true'
            });
            await pet.save();
            id = pet._id;
        });
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 404 if id is invalid', async () => {
            id = 1;
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should return 404 if the pet with the given id was not found', async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should return 404 if no owner with the given id was found', async () => {
            owner._id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it('should update the role if input is valid', async () => {
            await exec();
            const updatedPet = await Pet.findOne({_id: pet._id});
            expect(updatedPet.microChip).toBe(newMicroChip);
        });
    });
    describe('DELETE /:id', () => {

    });
});