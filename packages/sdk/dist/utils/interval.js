"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startInterval = void 0;
const startInterval = (callback, ms) => {
    callback();
    return setInterval(callback, ms);
};
exports.startInterval = startInterval;
