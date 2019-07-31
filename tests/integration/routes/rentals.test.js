"use strict";
const request = require('supertest');
const {Rental} = require('../../../api/models/rental');
const {User} = require('../../../api/models/user');
const mongoose = require('mongoose');
let server;
describe('/api/rentals route', () => {
    beforeEach(() => {
        server = require('../../../index');
    });
    afterEach(async () => {
        server.close();
        await Rental.deleteMany({});
    });
    describe('GET', () => {
        it('should return rental',async ()=>{
            const owner={
              name:'userName',
              address:'115 Winding Way'
            };
            const room = {
                size:'single',
                level:1,
                caretaker:'caretaker',
                maid:'maid',
                outdoorAccess:true,
                dailyRentalRate:250,
                name:'S0'
            };
            const pet = {
                name:'petName'
            };
            const rental = new Rental({
                owner:owner,
                room:room,
                pet:pet
            });
            await rental.save();
            const id = rental._id;
            const token = new User({isAdmin:true}).generateAuthToken();
            const res = await request(server)
                .get(`/api/rentals/${id}`)
                .set('x-auth-token',token);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('dateOut')
        });
    });
});