"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const contact_service_1 = require("./contact.service");
describe('ContactService', () => {
    let service;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({});
        service = testing_1.TestBed.inject(contact_service_1.ContactService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
