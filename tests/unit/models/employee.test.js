"use strict";
const {Employee}= require('../../../api/models/employee');
const {Role}= require('../../../api/models/role');


describe('setSalary method',()=>{
    it('should set salary based on qualification rate',()=>{
        const role = new Role({title:'veterinarian'});
        role.setQualificationRate();
        const employee = new Employee({name:'name',role,phone:'12345'});
        employee.setSalary();
        expect(employee.salary).toBe(45000)
    });
});