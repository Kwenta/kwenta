"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getenv = exports.reqenv = exports.clone = exports.sleep = void 0;
const sleep = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, ms);
    });
};
exports.sleep = sleep;
const clone = (obj) => {
    if (typeof obj === 'undefined') {
        throw new Error(`Trying to clone undefined object`);
    }
    return Object.assign({}, obj);
};
exports.clone = clone;
const reqenv = (name) => {
    const value = process.env[name];
    if (value === undefined) {
        throw new Error(`missing env var ${name}`);
    }
    return value;
};
exports.reqenv = reqenv;
const getenv = (name, fallback) => {
    return process.env[name] || fallback;
};
exports.getenv = getenv;
//# sourceMappingURL=misc.js.map