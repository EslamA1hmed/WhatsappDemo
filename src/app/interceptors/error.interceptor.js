"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorInterceptor = void 0;
const errorInterceptor = (req, next) => {
    return next(req);
};
exports.errorInterceptor = errorInterceptor;
