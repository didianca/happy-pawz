const {User}=require('../../../api/models/user');
const jwt= require('jsonwebtoken');
const config= require('config');

describe('user.generateAuthToken',()=>{
   it('should return a valid JWT',()=>{
       const payload = {_id:1,isAdmin:true};
        const user = new User(payload);
        const token = user.generateAuthToken();
        const decoded =jwt.verify(token,config.get('jwtPrivateKey'));
        expect(decoded).toMatchObject(payload)
   })
});