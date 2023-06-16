"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.undoL1ToL2Alias = exports.applyL1ToL2Alias = exports.L1_TO_L2_ALIAS_OFFSET = void 0;
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
const common_1 = require("../common");
exports.L1_TO_L2_ALIAS_OFFSET = '0x1111000000000000000000000000000000001111';
const applyL1ToL2Alias = (address) => {
    if (!(0, address_1.isAddress)(address)) {
        throw new Error(`not a valid address: ${address}`);
    }
    return (0, common_1.bnToAddress)(bignumber_1.BigNumber.from(address).add(exports.L1_TO_L2_ALIAS_OFFSET));
};
exports.applyL1ToL2Alias = applyL1ToL2Alias;
const undoL1ToL2Alias = (address) => {
    if (!(0, address_1.isAddress)(address)) {
        throw new Error(`not a valid address: ${address}`);
    }
    return (0, common_1.bnToAddress)(bignumber_1.BigNumber.from(address).sub(exports.L1_TO_L2_ALIAS_OFFSET));
};
exports.undoL1ToL2Alias = undoL1ToL2Alias;
//# sourceMappingURL=alias.js.map