/// <reference types="node" />
/// <reference types="lodash" />
import Wei from '@synthetixio/wei';
import KwentaSDK from '..';
import { NetworkId } from '../types/common';
import { FuturesMarketKey } from '../types/futures';
import { SynthPrice, PricesListener, PricesMap } from '../types/prices';
export default class PricesService {
    private sdk;
    private offChainPrices;
    private onChainPrices;
    private ratesInterval?;
    private pyth;
    private lastConnectionTime;
    private wsConnected;
    private server;
    private connectionMonitorId?;
    constructor(sdk: KwentaSDK);
    get currentPrices(): {
        onChain: Partial<Record<import("../types/prices").AssetKey, Wei>>;
        offChain: Partial<Record<import("../types/prices").AssetKey, Wei>>;
    };
    get pythIds(): string[];
    getOffchainPrice(marketKey: FuturesMarketKey): Wei;
    startPriceUpdates(intervalTime: number): Promise<void>;
    onPricesUpdated(listener: PricesListener): import("events");
    removePricesListener(listener: PricesListener): import("events");
    removePricesListeners(): void;
    onPricesConnectionUpdated(listener: (status: {
        connected: boolean;
        error?: Error | undefined;
    }) => void): import("events");
    removeConnectionListeners(): void;
    getOnChainPrices(): Promise<Record<string, Wei>>;
    getOffChainPrices(): Promise<Record<string, Wei>>;
    getPreviousDayPrices(marketAssets: string[], networkId?: NetworkId): Promise<SynthPrice[]>;
    getPythPriceUpdateData(marketKey: FuturesMarketKey): Promise<string[]>;
    private formatOffChainPrices;
    private connectToPyth;
    private setWsConnected;
    private setEventListeners;
    private monitorConnection;
    private switchConnection;
    private formatPythPrice;
    throttleOffChainPricesUpdate: import("lodash").DebouncedFunc<(offChainPrices: PricesMap) => void>;
    private subscribeToPythPriceUpdates;
}
