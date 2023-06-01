import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js';
import Wei, { wei } from '@synthetixio/wei';
import { formatEther, parseBytes32String } from 'ethers/lib/utils.js';
import request, { gql } from 'graphql-request';
import { throttle } from 'lodash';
import KwentaSDK from 'sdk';

import { MARKETS, MARKET_ASSETS_BY_PYTH_ID } from 'sdk/constants/futures';
import { PERIOD_IN_SECONDS } from 'sdk/constants/period';
import { ADDITIONAL_SYNTHS, PRICE_UPDATE_THROTTLE, PYTH_IDS } from 'sdk/constants/prices';
import { NetworkId, PriceServer } from 'sdk/types/common';
import { FuturesMarketKey } from 'sdk/types/futures';
import {
	CurrencyPrice,
	SynthPrice,
	PricesListener,
	PricesMap,
	SynthPricesTuple,
} from 'sdk/types/prices';
import { getDisplayAsset, getPythNetworkUrl, normalizePythId } from 'sdk/utils/futures';
import { startInterval } from 'sdk/utils/interval';
import { getRatesEndpoint } from 'sdk/utils/prices';
import { scale } from 'utils/formatters/number';
import { MarketAssetByKey } from 'utils/futures';
import logError from 'utils/logError';

import * as sdkErrors from '../common/errors';

const DEBUG_WS = false;
const LOG_WS = process.env.NODE_ENV !== 'production' && DEBUG_WS;
const PRICE_SERVER = process.env.NEXT_PUBLIC_DEFAULT_PRICE_SERVICE === 'KWENTA' ? 'KWENTA' : 'PYTH';

export default class PricesService {
	private sdk: KwentaSDK;
	private offChainPrices: PricesMap = {};
	private onChainPrices: PricesMap = {};
	private ratesInterval: number | undefined;
	private pyth!: EvmPriceServiceConnection;
	private retryCount: number = 0;
	private maxRetries: number = 5;
	private server: PriceServer = PRICE_SERVER;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
		this.setEventListeners();
		this.connectToPyth(sdk.context.networkId, this.server);
	}

	get currentPrices() {
		return {
			onChain: this.onChainPrices,
			offChain: this.offChainPrices,
		};
	}

	get pythIds() {
		return this.sdk.context.isMainnet ? PYTH_IDS.mainnet : PYTH_IDS.testnet;
	}

	public getOffchainPrice(marketKey: FuturesMarketKey) {
		const price = this.offChainPrices[MarketAssetByKey[marketKey]];
		if (!price) throw new Error(`No price data for ${marketKey}`);
		return price;
	}

	public async startPriceUpdates(intervalTime: number) {
		// Poll the onchain prices
		if (!this.ratesInterval) {
			this.ratesInterval = startInterval(async () => {
				try {
					this.onChainPrices = await this.getOnChainPrices();
					this.sdk.context.events.emit('prices_updated', {
						prices: this.onChainPrices,
						type: 'on_chain',
					});
				} catch (err) {
					logError(err);
				}
			}, intervalTime);
		}
	}

	public onPricesUpdated(listener: PricesListener) {
		return this.sdk.context.events.on('prices_updated', listener);
	}

	public removePricesListener(listener: PricesListener) {
		return this.sdk.context.events.off('prices_updated', listener);
	}

	public removePricesListeners() {
		this.sdk.context.events.removeAllListeners('prices_updated');
	}

	public onPricesConnectionUpdated(
		listener: (status: { connected: boolean; error?: Error | undefined }) => void
	) {
		return this.sdk.context.events.on('prices_connection_update', listener);
	}

	public removeConnectionListeners() {
		this.sdk.context.events.removeAllListeners('prices_connection_update');
	}

	public async getOnChainPrices() {
		if (!this.sdk.context.contracts.SynthUtil || !this.sdk.context.contracts.ExchangeRates) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const synthPrices: Record<string, Wei> = {};

		const [synthsRates, ratesForCurrencies] = (await Promise.all([
			this.sdk.context.contracts.SynthUtil.synthsRates(),
			this.sdk.context.contracts.ExchangeRates.ratesForCurrencies(ADDITIONAL_SYNTHS),
		])) as [SynthPricesTuple, CurrencyPrice[]];

		const synths = [...synthsRates[0], ...ADDITIONAL_SYNTHS];
		const rates = [...synthsRates[1], ...ratesForCurrencies] as CurrencyPrice[];

		synths.forEach((currencyKeyBytes32, idx: number) => {
			const currencyKey = parseBytes32String(currencyKeyBytes32);
			const marketAsset = MarketAssetByKey[currencyKey as FuturesMarketKey];

			const rate = Number(formatEther(rates[idx]));
			const price = wei(rate);

			synthPrices[currencyKey] = price;
			if (marketAsset) synthPrices[marketAsset] = price;
		});

		return synthPrices;
	}

	public async getOffChainPrices() {
		const pythPrices = await this.pyth.getLatestPriceFeeds(this.pythIds);
		return this.formatOffChainPrices(pythPrices ?? []);
	}

	public async getPreviousDayPrices(marketAssets: string[], networkId?: NetworkId) {
		const ratesEndpoint = getRatesEndpoint(networkId || this.sdk.context.networkId);
		const minTimestamp = Math.floor((Date.now() - PERIOD_IN_SECONDS.ONE_DAY * 1000) / 1000);

		const rateUpdateQueries = marketAssets.map((asset) => {
			return gql`
			# last before timestamp
			${asset}: rateUpdates(
				first: 1
				where: { synth: "${getDisplayAsset(asset) ?? asset}", timestamp_gte: $minTimestamp }
				orderBy: timestamp
				orderDirection: asc
			) {
				synth
				rate
			}
		`;
		});

		const response = await request(
			ratesEndpoint,
			gql`
				query rateUpdates($minTimestamp: BigInt!) {
					${rateUpdateQueries.reduce((acc: string, curr: string) => {
						return acc + curr;
					})}
			}`,
			{
				minTimestamp: minTimestamp,
			}
		);
		const prices = (response ? Object.values(response).flat() : []) as SynthPrice[];

		//TODO: remove this once the rates are fixed
		return prices.map((price) =>
			price.synth === MarketAssetByKey[FuturesMarketKey.sPEPEPERP]
				? { ...price, rate: wei(price.rate.toString()).div(1e10).toString() }
				: price
		) as SynthPrice[];
	}

	public async getPythPriceUpdateData(marketKey: FuturesMarketKey) {
		const pythIds = MARKETS[marketKey]?.pythIds;
		const pythId = pythIds ? pythIds[this.sdk.context.isMainnet ? 'mainnet' : 'testnet'] : null;
		if (!pythId) throw new Error(sdkErrors.NO_PYTH_ID);

		const updateData = await this.pyth.getPriceFeedsUpdateData([pythId]);
		return updateData;
	}

	private formatOffChainPrices(pythPrices: PriceFeed[]) {
		const offChainPrices =
			pythPrices?.reduce<Record<string, Wei>>((acc, p) => {
				const price = this.formatPythPrice(p);
				// Have to handle inconsistent id formatting between ws and http
				const id = normalizePythId(p.id);
				const marketKey = MARKET_ASSETS_BY_PYTH_ID[id];
				if (marketKey) {
					acc[marketKey] = price;
				}
				return acc;
			}, {}) ?? {};
		return offChainPrices;
	}

	private connectToPyth(networkId: NetworkId, server: PriceServer) {
		if (this.pyth) {
			this.pyth.closeWebSocket();
		}

		this.pyth = new EvmPriceServiceConnection(getPythNetworkUrl(networkId, server), {
			logger: LOG_WS ? console : undefined,
		});

		this.pyth
			.getPriceFeedIds()
			.then((_) => {
				this.sdk.context.events.emit('prices_connection_update', {
					connected: true,
				});
			})
			.catch((error) => {
				this.sdk.context.events.emit('prices_connection_update', {
					connected: false,
					error: error || new Error('pyth prices ws connection failed'),
				});
			});
	}

	private setEventListeners() {
		this.sdk.context.events.on('network_changed', (params) => {
			if (this.pyth) {
				this.pyth.closeWebSocket();
			}
			this.connectToPyth(params.networkId, this.server);
		});

		this.sdk.context.events.on('prices_connection_update', (params) => {
			if (params.connected) {
				this.subscribeToPythPriceUpdates();
			} else {
				this.retryConnection(this.sdk.context.networkId);
			}
		});

		if (this.pyth) {
			this.pyth.onWsError = (error: Error) => {
				this.sdk.context.events.emit('prices_connection_update', {
					connected: false,
					error: error || new Error('pyth prices ws connection failed'),
				});
			};
		}
	}

	private retryConnection(networkId: NetworkId) {
		if (this.retryCount < this.maxRetries) {
			this.retryCount++;
			setTimeout(() => {
				this.connectToPyth(networkId, this.server);
			}, Math.pow(2, this.retryCount) * 100);
		} else {
			logError(new Error('Maximum retries exceeded'));
			this.retryCount = 0;
			this.server = this.server === 'KWENTA' ? 'PYTH' : 'KWENTA';
			this.connectToPyth(networkId, this.server);
		}
	}

	private formatPythPrice(priceFeed: PriceFeed): Wei {
		const price = priceFeed.getPriceUnchecked();
		return scale(wei(price.price), price.expo);
	}

	throttleOffChainPricesUpdate = throttle((offChainPrices: PricesMap) => {
		this.sdk.context.events.emit('prices_updated', {
			prices: offChainPrices,
			type: 'off_chain',
		});
	}, PRICE_UPDATE_THROTTLE);

	private async subscribeToPythPriceUpdates() {
		try {
			this.offChainPrices = await this.getOffChainPrices();
			this.sdk.context.events.emit('prices_updated', {
				prices: this.offChainPrices,
				type: 'off_chain',
			});
		} catch (err) {
			logError(err);
		}
		this.pyth.subscribePriceFeedUpdates(this.pythIds, (priceFeed) => {
			const id = normalizePythId(priceFeed.id);
			const assetKey = MARKET_ASSETS_BY_PYTH_ID[id];
			if (assetKey) {
				const price = this.formatPythPrice(priceFeed);
				this.offChainPrices[assetKey] = price;
			}
			this.throttleOffChainPricesUpdate(this.offChainPrices);
		});
	}
}
