import { HexString } from "@pythnetwork/price-service-sdk";
/**
 * Convert http(s) endpoint to ws(s) endpoint.
 *
 * @param endpoint Http(s) protocol endpoint
 * @returns Ws(s) protocol endpoint of the same address
 */
export declare function makeWebsocketUrl(endpoint: string): string;
export declare function removeLeading0xIfExists(id: HexString): HexString;
//# sourceMappingURL=utils.d.ts.map