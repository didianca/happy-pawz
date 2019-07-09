const request = require('supertest');
const {User} = require('../../../api/models/user');
const {Role} = require('../../../api/models/role');
let server;

describe('auth middleware',()=>{
    //start the server
    beforeEach(() => {server = require('../../../index');});
    //stop the server and clean up
    afterEach( async () => {
        await  Role.deleteMany({});
        server.close();
    });
    let token;
    const exec=()=>{
       return request(server)
           .post('/api/roles')
           .set('x-auth-token',token)
           .send({title:'role1'})

    };
    beforeEach(()=>{
        token = new User({isAdmin:true}).generateAuthToken();
    });
    it('should return 200 if token is valid',async ()=>{
        const res = await exec();
        expect(res.status).toBe(200);
    }) ;
    it('should return 401 if no token is provided',async ()=>{
       token ='';
        const res = await exec();
        expect(res.status).toBe(401);
   }) ;
    it('should return 400 if the token provided is invalid',async ()=>{
        token ='a';
        const res = await exec();
        expect(res.status).toBe(400);
    }) ;
});