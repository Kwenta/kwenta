"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChainId = void 0;
const getChainId = async (provider) => {
    const network = await provider.getNetwork();
    return network.chainId;
};
exports.getChainId = getChainId;
//# sourceMappingURL=network.js.map