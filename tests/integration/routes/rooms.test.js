"use strict";
const request = require('supertest');
const {Room} = require('../../../api/models/room');
const {Employee} = require('../../../api/models/employee');
const {User} = require('../../../api/models/user');
const mongoose = require('mongoose');
let server;
describe('/api/rooms route', () => {
    beforeEach(() => {
        server = require('../../../index');
    });
    afterEach(async () => {
        server.close();
        await Room.deleteMany({});
        await Employee.deleteMany({});
    });
    describe('GET ', () => {
        it('should return all rooms', async () => {
            const caretaker = {
                name: 'Jon Doe',
                role: 'caretaker',
                phone: '12345'
            };
            const maid = {
                name: 'Jon Doe',
                role: 'maid',
                phone: '12345'
            };
            await Room.collection.insertMany([
                {size: 'single', level: '0', caretakerId: caretaker, maidId: maid, dailyRentalRate: 1},
                {size: 'single', level: '1', caretakerId: caretaker, maidId: maid, dailyRentalRate: 2}
            ]);
            const token = new User({isAdmin: true}).generateAuthToken();
            const res = await request(server)
                .get('/api/rooms')
                .set('x-auth-token', token);
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body.some(room => room.size === 'single')).toBeTruthy();
            expect(res.body.some(room => room.level === 0)).toBeTruthy();
            expect(res.body.some(room => room.level === 1)).toBeTruthy();
            expect(res.body[0].dailyRentalRate).toBe(1);
            expect(res.body[1].dailyRentalRate).toBe(2);

        });
    });
    describe('GET /:id', () => {
        it('should return 404 if no token was provided', async () => {
            const caretaker = {
                name: 'Jon Doe',
                role: 'caretaker',
                phone: '12345'
            };
            const maid = {
                name: 'Jon Doe',
                role: 'maid',
                phone: '12345'
            };
            const room = new Room({
                size: 'single',
                level: '0',
                caretaker: caretaker,
                maid: maid
            });
            room.setOutdoorAccess();
            room.setDailyRentalRateAndName();
            await room.save();
            const id ='1';
            const res = await request(server)
                .get(`/api/rooms/${id}`);
            expect(res.status).toBe(404);
        });
        it('should return 404 if no room with the given id was found', async () => {
            const caretaker = {
                name: 'Jon Doe',
                role: 'caretaker',
                phone: '12345'
            };
            const maid = {
                name: 'Jon Doe',
                role: 'maid',
                phone: '12345'
            };
            const room = new Room({
                size: 'single',
                level: '0',
                caretaker: caretaker,
                maid: maid
            });
            room.setOutdoorAccess();
            room.setDailyRentalRateAndName();
            await room.save();
            const id =mongoose.Types.ObjectId();
            const res = await request(server)
                .get(`/api/rooms/${id}`);
            expect(res.status).toBe(404);
        });
        it('should return the room', async () => {
            const caretaker = {
                name: 'Jon Doe',
                role: 'caretaker',
                phone: '12345'
            };
            const maid = {
                name: 'Jon Doe',
                role: 'maid',
                phone: '12345'
            };
            const room = new Room({
                size: 'single',
                level: '0',
                caretaker: caretaker,
                maid: maid
            });
            room.setOutdoorAccess();
            room.setDailyRentalRateAndName();
            await room.save();
            const id =room._id;
            const res = await request(server)
                .get(`/api/rooms/${id}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('size','single');
            expect(res.body).toHaveProperty('level',0);
            expect(res.body).toHaveProperty('caretaker');
            expect(res.body).toHaveProperty('maid');
            expect(res.body).toHaveProperty('dailyRentalRate',250);
        });
    });
});