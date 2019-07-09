"use strict";
const {Room} = require('../../../api/models/room');

describe('room model methods', () => {
    describe('setOutdoorAccess method', () => {
        it('should set outDoorAccess to false if level is 1', () => {
            const room = new Room({level: 1});
            room.setOutdoorAccess();
            expect(room.outdoorAccess).toBe(false)
        });
        it('should set outDoorAccess to true if level is 0', () => {
            const room = new Room({level: 0});
            room.setOutdoorAccess();
            expect(room.outdoorAccess).toBe(true)
        });
    });
    describe('setDailyRentalRateAndName',()=>{
        it('should set dailyRentalRate to 250 and name S0 if size is single and outdoorAccess is true',()=>{
            const room= new Room({size:'single',outdoorAccess:true});
            room.setDailyRentalRateAndName();
            expect(room.dailyRentalRate).toBe(250);
            expect(room.name).toBe('S0')
        });
        it('should set dailyRentalRate to 150 and name S1 if size is single and outdoorAccess is false',()=>{
            const room= new Room({size:'single',outdoorAccess:false});
            room.setDailyRentalRateAndName();
            expect(room.dailyRentalRate).toBe(150);
            expect(room.name).toBe('S1')
        });
        it('should set dailyRentalRate to 200 and name M0 if size is multiple and outdoorAccess is true',()=>{
            const room= new Room({size:'multiple',outdoorAccess:true});
            room.setDailyRentalRateAndName();
            expect(room.dailyRentalRate).toBe(200);
            expect(room.name).toBe('M0')
        });
        it('should set dailyRentalRate to 100 and name M1 if size is multiple and outdoorAccess is false',()=>{
            const room= new Room({size:'multiple',outdoorAccess:false});
            room.setDailyRentalRateAndName();
            expect(room.dailyRentalRate).toBe(100);
            expect(room.name).toBe('M1')
        });
    });
});