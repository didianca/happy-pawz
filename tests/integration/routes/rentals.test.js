"use strict";
const request = require('supertest');
const {Rental} = require('../../../api/models/rental');
const {User} = require('../../../api/models/user');
const {Owner} = require('../../../api/models/owner');
const {Room} = require('../../../api/models/room');
const {Pet} = require('../../../api/models/pet');
const {Role} = require('../../../api/models/role');
const mongoose = require('mongoose');
let server;
describe('/api/rentals route', () => {
    beforeEach(() => {
        server = require('../../../index');
    });
    afterEach(async () => {
        server.close();
        await Rental.deleteMany({});
        await Owner.deleteMany({});
        await Room.deleteMany({});
        await Pet.deleteMany({});
        await User.deleteMany({});
        await Role.deleteMany({});
    });
    describe('GET', () => {
        it('should return 404 if no rental with the given id was found', async () => {
            const owner = {
                name: 'userName',
                address: '115 Winding Way'
            };
            const room = {
                size: 'single',
                level: 1,
                caretaker: 'caretaker',
                maid: 'maid',
                outdoorAccess: true,
                dailyRentalRate: 250,
                name: 'S0'
            };
            const pet = {
                name: 'petName'
            };
            const rental = new Rental({
                owner: owner,
                room: room,
                pet: pet
            });
            await rental.save();
            const id = mongoose.Types.ObjectId();
            const token = new User({isAdmin: true}).generateAuthToken();
            const res = await request(server)
                .get(`/api/rentals/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(404);
        });
        it('should return rental', async () => {
            const owner = {
                name: 'userName',
                address: '115 Winding Way'
            };
            const room = {
                size: 'single',
                level: 1,
                caretaker: 'caretaker',
                maid: 'maid',
                outdoorAccess: true,
                dailyRentalRate: 250,
                name: 'S0'
            };
            const pet = {
                name: 'petName'
            };
            const rental = new Rental({
                owner: owner,
                room: room,
                pet: pet
            });
            await rental.save();
            const id = rental._id;
            const token = new User({isAdmin: true}).generateAuthToken();
            const res = await request(server)
                .get(`/api/rentals/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('dateOut')
        });
    });
    describe('POST/ ', () => {
        let token;
        let room;
        let owner;
        let pet;
        const exec = async () => {
            return await request(server)
                .post('/api/rentals')
                .set('x-auth-token', token)
                .send({ownerId: owner._id, roomId: room._id, petId: pet._id})
        };
        beforeEach(async () => {
            owner = new Owner({
                user: new User({name: 'userName', phone: '123456'}),
                address: '30 Findlay St,Cincinnati,OH'
            });
            await owner.save();
            room = new Room({
                size: 'single',
                level: 0,
                caretaker: {
                    name: 'caretaker name',
                    role: new Role({title: 'caretaker'}),
                    phone: '12345'
                },
                maid: {
                    name: 'maid name',
                    role: new Role({title: 'maid'}),
                    phone: '12345'
                }
            });
            room.setOutdoorAccess();
            room.setDailyRentalRateAndName();
            await room.save();
            pet = new Pet({
                name: 'pet',
                microChip: '3333333333',
                ownerInfo: {
                    name: 'userName',
                    phone: '123456'
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
            token = new User({isAdmin: true}).generateAuthToken();
        });
        it('should save the rental', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('dateOut')
        });
        it('should return 400 if owner with the given id was not found', async () => {
            owner._id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if room with the given id was not found', async () => {
            room._id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if number of available rooms is 0', async () => {
            room = await Room.findOneAndUpdate({_id:room._id},{$set:{numberOfAvailable:0}});
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if pet with the given id was not found', async () => {
            pet._id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if pet is already accommodated ', async () => {
            pet = await Pet.findOneAndUpdate({_id:pet._id},{$set:{isAccommodated:true}});
            const res = await exec();
            expect(res.status).toBe(400);
        });
    });
});