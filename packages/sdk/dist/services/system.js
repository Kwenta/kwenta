"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../common/errors");
const files_1 = require("../utils/files");
const system_1 = require("../utils/system");
class SystemService {
    constructor(sdk) {
        this.sdk = sdk;
    }
    getSynthetixStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const { SystemStatus, DappMaintenance } = this.sdk.context.multicallContracts;
            if (!SystemStatus || !DappMaintenance) {
                throw new Error(errors_1.UNSUPPORTED_NETWORK);
            }
            const [isSystemUpgrading, isExchangePaused] = (yield this.sdk.context.multicallProvider.all([
                SystemStatus.isSystemUpgrading(),
                DappMaintenance.isPausedSX(),
            ]));
            return isSystemUpgrading || isExchangePaused;
        });
    }
    getKwentaStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield files_1.client.get('kwenta-status.json', {
                headers: { 'Cache-Control': 'no-cache' },
            });
            return Object.assign(Object.assign({}, response.data), { status: system_1.StatusMap[response.data.status] });
        });
    }
}
exports.default = SystemService;
