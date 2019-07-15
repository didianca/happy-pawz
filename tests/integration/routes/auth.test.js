"use strict";
const request = require('supertest');
const {User} = require('../../../api/models/user');
const bcrypt =require('bcrypt');
let server;
describe('login /api/routes/auth.js',()=>{
   beforeEach(()=>{
       server = require('../../../index');
   }) ;
   afterEach(async ()=>{
       server.close();
       await User.deleteMany({});
   });
    describe('/POST',()=>{
        let name;
        let token;
        let email;
        let password;
        let phone;
        const exec = async () => {
            return await request(server)  //login
                .post('/api/auth')
                .send({email, password});
        };
        beforeEach(async () => {
            name='name';
            email = 'email@email.com';
            password = '123456';
            phone = '12345';
           const user = new User({name,email,password,phone}); //sign up
            const salt = await  bcrypt.genSalt(10);
            user.password = await  bcrypt.hash(user.password,salt);
            token = user.generateAuthToken();
            await user.save()
        });
        it('should find a user by email',async ()=>{
           await exec();
           const user = await User.findOne({email});
           expect(user.email).toBe(email);
    });
        it('should compare passwords',async ()=>{
           await exec();
           const user = await User.findOne({email});
           const validPassword = await bcrypt.compare(password,user.password);
            expect(validPassword).toBeTruthy()
        });
        it('should return 400 if email doesn\'t match',async ()=>{
           email = 'otherEmail@email.com';
           const res = await exec();
           expect(res.status).toBe(400);
        });
        it('should return 400 if password doesn\'t match',async ()=>{
           password='aaaaaa';
           const res = await exec();
           expect(res.status).toBe(400);
        });
        it('should attach token to header',async ()=>{
           const res = await exec();
           expect(res.header).toHaveProperty('x-auth-token',token)
        });
    });
});