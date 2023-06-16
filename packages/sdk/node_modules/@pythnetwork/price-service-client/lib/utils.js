"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLeading0xIfExists = exports.makeWebsocketUrl = void 0;
/**
 * Convert http(s) endpoint to ws(s) endpoint.
 *
 * @param endpoint Http(s) protocol endpoint
 * @returns Ws(s) protocol endpoint of the same address
 */
function makeWebsocketUrl(endpoint) {
    const url = new URL("ws", endpoint);
    const useHttps = url.protocol === "https:";
    url.protocol = useHttps ? "wss:" : "ws:";
    return url.toString();
}
exports.makeWebsocketUrl = makeWebsocketUrl;
function removeLeading0xIfExists(id) {
    if (id.startsWith("0x")) {
        return id.substring(2);
    }
    else {
        return id;
    }
}
exports.removeLeading0xIfExists = removeLeading0xIfExists;
