"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/***************************************************************************************************
 * POLYFILLS
 ***************************************************************************************************/
const buffer_1 = require("buffer");
window.global = window;
window.process = { env: { DEBUG: undefined } };
window.Buffer = buffer_1.Buffer;
