"use strict";
const {Role}= require('../../../api/models/role');

describe('setQualificationRate method',()=>{
    it('should set qualification rate to 50 if title is veterinarian',()=>{
       const role = new Role({title:'veterinarian'});
       role.setQualificationRate();
       expect(role.qualificationRate).toBe(50)
    });
    it('should set qualification rate to 25 if title is accountant',()=>{
        const role = new Role({title:'accountant'});
        role.setQualificationRate();
        expect(role.qualificationRate).toBe(25)
    });
});