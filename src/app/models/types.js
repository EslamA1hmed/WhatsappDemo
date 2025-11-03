"use strict";
// src/app/models/chat.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = exports.MessageDirection = exports.MessageStatus = void 0;
// Message Status Enum
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["PENDING"] = "pending";
    MessageStatus["SENT"] = "sent";
    MessageStatus["DELIVERED"] = "delivered";
    MessageStatus["READ"] = "read";
    MessageStatus["FAILED"] = "failed";
})(MessageStatus = exports.MessageStatus || (exports.MessageStatus = {}));
// Message Direction Enum
var MessageDirection;
(function (MessageDirection) {
    MessageDirection["SENT"] = "SENT";
    MessageDirection["RECEIVED"] = "RECEIVED";
})(MessageDirection = exports.MessageDirection || (exports.MessageDirection = {}));
// Message Type Enum
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["VIDEO"] = "video";
    MessageType["DOCUMENT"] = "document";
    MessageType["TEMPLATE"] = "template";
    MessageType["AUDIO"] = "audio";
    MessageType["LOCATION"] = "location";
    MessageType["CONTACTS"] = "contacts";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
