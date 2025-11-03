"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const error_interceptor_1 = require("./error.interceptor");
describe('errorInterceptor', () => {
    const interceptor = (req, next) => testing_1.TestBed.runInInjectionContext(() => (0, error_interceptor_1.errorInterceptor)(req, next));
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({});
    });
    it('should be created', () => {
        expect(interceptor).toBeTruthy();
    });
});
