"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const auth_guard_1 = require("./auth.guard");
describe('authGuard', () => {
    const executeGuard = (...guardParameters) => testing_1.TestBed.runInInjectionContext(() => (0, auth_guard_1.authGuard)(...guardParameters));
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({});
    });
    it('should be created', () => {
        expect(executeGuard).toBeTruthy();
    });
});
