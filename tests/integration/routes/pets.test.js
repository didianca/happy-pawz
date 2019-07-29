"use strict";
const request = require('supertest');
const {Pet} = require('../../../api/models/pet');
const {Owner} = require('../../../api/models/owner');
const {User} = require('../../../api/models/user');
const mongoose = require('mongoose');
let server;
describe('/api/pets route', () => {
    beforeEach(() => {
        server = require('../../../index');
    });
    afterEach(async () => {
        server.close();
        await Pet.deleteMany({});
        await Owner.deleteMany({})
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
        beforeEach(async () => {
            owner = {
                name: 'ownerName',
                phone: '123456',
                address: '30 Findlay St,Cincinnati, OH'
            };
            pet = new Pet({
                name: 'pet',
                microChip: '1111111111',
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
        });
        it('should return 401 if no token is provided', async () => {
            const id = mongoose.Types.ObjectId();
            token = '';
            const res = await request(server)
                .get(`/api/pets/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(401);
        });
        it('should return 404 if the id is invalid', async () => {
            const id = '1';
            const res = await request(server)
                .get(`/api/pets/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(404);
        });
        it('should return 404 if no pet with the  given id was found', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server)
                .get(`/api/pets/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(404);
        });
        it('should return the pet', async () => {
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
                    microChip: '111111111',
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
                user:new User({name:'userName',phone:'123456'}),
                address:'30 Findlay St,Cincinnati,OH'
            });
            await owner.save();
            token = new User({isAdmin:true}).generateAuthToken();
        });
        it('should return 401 if client is not logged in',async ()=>{
           token = '';
           const res = await exec();
           expect(res.status).toBe(401);
        });
    });
});