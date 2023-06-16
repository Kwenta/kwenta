"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strPadLeft = exports.truncateString = exports.truncateAddress = void 0;
const truncateAddress = (address, first = 5, last = 5) => `${address.slice(0, first)}...${address.slice(-last, address.length)}`;
exports.truncateAddress = truncateAddress;
const truncateString = (text, max = 256) => {
    if ((text === null || text === void 0 ? void 0 : text.length) > max)
        return text.substring(0, max) + ' ...';
    return text;
};
exports.truncateString = truncateString;
const strPadLeft = (string, pad, length) => {
    return (new Array(length + 1).join(pad) + string).slice(-length);
};
exports.strPadLeft = strPadLeft;
