"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const auth_interceptor_1 = require("./auth.interceptor");
describe('authInterceptor', () => {
    const interceptor = (req, next) => testing_1.TestBed.runInInjectionContext(() => (0, auth_interceptor_1.authInterceptor)(req, next));
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({});
    });
    it('should be created', () => {
        expect(interceptor).toBeTruthy();
    });
});
