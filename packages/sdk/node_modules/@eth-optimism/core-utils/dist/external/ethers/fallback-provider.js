"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackProvider = void 0;
const providers_1 = require("@ethersproject/providers");
const FallbackProvider = (config, headers) => {
    const configs = [];
    if (typeof config === 'string') {
        const urls = config.split(',');
        for (const [i, url] of urls.entries()) {
            const connectionInfo = { url };
            if (typeof headers === 'object') {
                connectionInfo.headers = headers;
            }
            configs.push({
                priority: i,
                provider: new providers_1.StaticJsonRpcProvider(connectionInfo),
            });
        }
        return new providers_1.FallbackProvider(configs);
    }
    return new providers_1.FallbackProvider(config);
};
exports.FallbackProvider = FallbackProvider;
//# sourceMappingURL=fallback-provider.js.map