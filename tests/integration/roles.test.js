const request= require('supertest');
let server;

describe('./api/roles',()=>{
    beforeEach(()=>{
        server = require('../../index');
    });
    afterEach(()=> { server.close(); });

    describe('GET /',()=>{
        it('should return all roles',async ()=>{
               const res = await request(server).get('/api/roles');
               expect(res.status).toBe(200)
            })
        })
    });
