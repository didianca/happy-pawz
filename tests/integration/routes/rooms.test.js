"use strict";
const request = require('supertest');
const {Room} = require('../../../api/models/room');
const {Employee} = require('../../../api/models/employee');
const {User} = require('../../../api/models/user');
const {Role} = require('../../../api/models/role');
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
                {size: 'single', level: '0', caretaker: caretaker, maid: maid, dailyRentalRate: 1},
                {size: 'single', level: '1', caretaker: caretaker, maid: maid, dailyRentalRate: 2}
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
        it('should not require authentication', async () => {
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
            const id = room._id;
            const token = '';
            const res = await request(server)
                .get(`/api/rooms/${id}`)
                .set('x-auth-token', token);
            expect(res.status).toBe(200);
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
            const id = mongoose.Types.ObjectId();
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
            const id = room._id;
            const res = await request(server)
                .get(`/api/rooms/${id}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('size', 'single');
            expect(res.body).toHaveProperty('level', 0);
            expect(res.body).toHaveProperty('caretaker');
            expect(res.body).toHaveProperty('maid');
            expect(res.body).toHaveProperty('dailyRentalRate', 250);
        });
    });
    describe('POST /', () => {
        let token;
        let caretaker;
        let maid;
        const exec = async () => {
            return await request(server)
                .post('/api/rooms')
                .set('x-auth-token', token)
                .send({
                    size: 'single',
                    level: '0',
                    caretakerId: caretaker._id,
                    maidId: maid._id
                })
        };
        beforeEach(async () => {
            caretaker = new Employee({
                name: 'caretaker name',
                role: new Role({title: 'caretaker'}),
                phone: '12345'
            });
            await caretaker.save();
            maid = new Employee({
                name: 'maid name',
                role: new Role({title: 'maid'}),
                phone: '12345'
            });
            await maid.save();
            token = new User({isAdmin: true}).generateAuthToken();
        });
        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it('should return 403 if client is not authorized', async () => {
            token = new User().generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        });
        it('should return 400 if there is no caretaker with the given id', async () => {
            caretaker._id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if there is no maid with the given id', async () => {
            maid._id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if the room is already registered', async () => {
            const room = new Room({
                size: 'single',
                level: '0',
                caretaker: {
                    name: 'caretaker name',
                    phone: '123456'
                },
                maid: {
                    name: 'maid name',
                    phone: '123456'
                }
            });
            room.setOutdoorAccess();
            room.setDailyRentalRateAndName();
            await room.save();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should set the outdoor access, daily rental rate, name and save the room', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'S0');
            expect(res.body).toHaveProperty('dailyRentalRate', 250);
            expect(res.body).toHaveProperty('outdoorAccess', true);
        })
    });
});