"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bnToAddress = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const address_1 = require("@ethersproject/address");
const hex_strings_1 = require("./hex-strings");
const bnToAddress = (bn) => {
    bn = bignumber_1.BigNumber.from(bn);
    if (bn.isNegative()) {
        bn = bignumber_1.BigNumber.from('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
            .add(bn)
            .add(1);
    }
    let addr = bn.toHexString();
    addr = (0, hex_strings_1.remove0x)(addr);
    addr = addr.padStart(40, '0');
    addr = addr.slice(addr.length - 40, addr.length);
    addr = (0, hex_strings_1.add0x)(addr);
    addr = (0, address_1.getAddress)(addr);
    return addr;
};
exports.bnToAddress = bnToAddress;
//# sourceMappingURL=bn.js.map