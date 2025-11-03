"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const chat_message_service_1 = require("./chat-message.service");
describe('ChatMessageService', () => {
    let service;
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({});
        service = testing_1.TestBed.inject(chat_message_service_1.ChatMessageService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
