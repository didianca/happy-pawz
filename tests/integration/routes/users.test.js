"use strict";
const request = require('supertest');
const {User} = require('../../../api/models/user');
let server;
/*Define the happy path
In each test we change one param that CLEARLY aligns with the name of the test*/

describe('sign up /api/routes/users.js', () => {
    beforeEach(() => {
        server = require('../../../index')
    });
    afterEach(async () => {
        server.close();
        await User.deleteMany({});
    });
    describe('/GET/me', () => {
        it('should return the logged in user', async () => {
            const user = new User({
                name: 'name1',
                email: 'email@email.com',
                password: '123456',
                phone: '123456'
            });
            await user.save();
            let token = user.generateAuthToken();
            const res = await request(server)
                .get('/api/users/me')
                .set('x-auth-token', token);
            expect(res.status).toBe(200);
            expect(res.body.email).toBe('email@email.com');
        })
    });
    describe('/POST', () => {
        let token;
        let name;
        let email;
        let password;
        let phone;
        const exec = async () => {
            return await request(server)
                .post('/api/users')
                .set('x-auth-token', token)
                .send({name, email, password, phone});
        };
        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'name1';
            email = 'email@email.com';
            password = '123456';
            phone = '123456';
        });
        it('should return 400 if user already registered', async () => {
            const user = new User({name, email, phone, password});
            await user.save();
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if name is less than 4 characters', async () => {
            name = '123';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 is name is longer than 50 characters', async () => {
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 is name is missing', async () => {
            name = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if email is not of type email', async () => {
            email = 'a';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if email is longer than 50 characters', async () => {
            let extraCharacters = new Array(52).join('a');
            email = `email${extraCharacters}@email.com`;
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 if email is missing', async () => {
            email = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 is password is less than 5 characters', async () => {
            password = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 is password is longer than 50 characters', async () => {
            password = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should return 400 is password is missing', async () => {
            password = '';
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it('should save the new user if input is valid', async () => {
            await exec();
            const user = await User.findOne({email: 'email@email.com'});
            expect(user).not.toBeNull();
        });
        it('should return the user if it is valid', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('email');
            expect(res.body).toHaveProperty('phone');
        });
    });
});
