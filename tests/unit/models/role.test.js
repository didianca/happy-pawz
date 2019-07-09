"use strict";
const {Role}= require('../../../api/models/role');

describe('setQualificationRate method',()=>{
    it('should set qualification rate to 50 if title is veterinarian or lawyer',()=>{
       const role = new Role({title:('veterinarian' || 'lawyer')});
       role.setQualificationRate();
       expect(role.qualificationRate).toBe(50)
    });
    it('should set qualification rate to 25 if title is accountant or medical assistant',()=>{
        const role = new Role({title:('accountant'||'medical assistant')});
        role.setQualificationRate();
        expect(role.qualificationRate).toBe(25)
    });
    it('should default qualification rate to 0 if title is any other',()=>{
        const role = new Role({title:'title'});
        role.setQualificationRate();
        expect(role.qualificationRate).toBe(0)
    });
});