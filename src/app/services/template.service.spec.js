"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const template_service_1 = require("./template.service");
describe('TemplateService', () => {
    let service;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({});
        service = testing_1.TestBed.inject(template_service_1.TemplateService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
