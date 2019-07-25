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
                {size:'single',level:'0',caretakerId:caretaker,maidId:maid},
                {size:'single',level:'1',caretakerId:caretaker,maidId:maid}
            ]);
            const token = new User({isAdmin:true}).generateAuthToken();
            const res  = await  request(server)
                .get('/api/rooms')
                .set('x-auth-token',token);
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            console.log(res.body);
            expect(res.body.some(room =>room.size === 'single')).toBeTruthy();
            expect(res.body.some(room =>room.level === 0)).toBeTruthy();
            expect(res.body.some(room =>room.level === 1)).toBeTruthy()
        });
    });
});