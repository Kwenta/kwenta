"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusMap = void 0;
const system_1 = require("../types/system");
exports.StatusMap = {
    '0': system_1.OperationalStatus.FullyOperational,
    '1': system_1.OperationalStatus.Degraded,
    '2': system_1.OperationalStatus.Offline,
};
