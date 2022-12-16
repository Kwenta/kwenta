import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { formatEther, parseBytes32String } from 'ethers/lib/utils.js';
import { throttle } from 'lodash';
import KwentaSDK from 'sdk';

import { MARKET_ASSETS_BY_PYTH_ID } from 'sdk/constants/futures';
import { ADDITIONAL_SYNTHS, PRICE_UPDATE_THROTTLE, PYTH_IDS } from 'sdk/constants/prices';
import { FuturesMarketKey } from 'sdk/types/futures';
import { CurrencyRate, PricesListener, PricesMap, SynthRatesTuple } from 'sdk/types/prices';
import { getPythNetworkUrl, normalizePythId } from 'sdk/utils/futures';
import { startInterval } from 'sdk/utils/interval';
import { scale } from 'utils/formatters/number';
import { MarketAssetByKey } from 'utils/futures';
import logError from 'utils/logError';

import * as sdkErrors from '../common/errors';

const DEBUG_WS = false;
const LOG_WS = process.env.NODE_ENV !== 'production' && DEBUG_WS;

export default class PricesService {
	private sdk: KwentaSDK;
	private offChainPrices: PricesMap = {};
	private onChainPrices: PricesMap = {};
	private ratesInterval: number | undefined;
	private pyth: EvmPriceServiceConnection;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;

		this.pyth = new EvmPriceServiceConnection(getPythNetworkUrl(sdk.context.networkId), {
			logger: LOG_WS ? console : undefined,
		});

		// TODO: Typed events
		this.sdk.context.events.on('network_changed', (params) => {
			if (this.pyth) {
				this.pyth.closeWebSocket();
			}
			this.pyth = new EvmPriceServiceConnection(getPythNetworkUrl(params.networkId), {
				logger: LOG_WS ? console : undefined,
			});
			this.pyth.onWsError = (error) => {
				// TODO: Feedback connection issue and display
				// prompt to try disabling add blocker
				logError(error);
			};
			this.subscribeToPythPriceUpdates();
		});
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

	public async getOnChainPrices() {
		if (!this.sdk.context.contracts.SynthUtil || !this.sdk.context.contracts.ExchangeRates) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const synthPrices: Record<string, Wei> = {};

		const [synthsRates, ratesForCurrencies] = (await Promise.all([
			this.sdk.context.contracts.SynthUtil.synthsRates(),
			this.sdk.context.contracts.ExchangeRates.ratesForCurrencies(ADDITIONAL_SYNTHS),
		])) as [SynthRatesTuple, CurrencyRate[]];

		const synths = [...synthsRates[0], ...ADDITIONAL_SYNTHS] as CurrencyKey[];
		const rates = [...synthsRates[1], ...ratesForCurrencies] as CurrencyRate[];

		synths.forEach((currencyKeyBytes32: CurrencyKey, idx: number) => {
			const currencyKey = parseBytes32String(currencyKeyBytes32) as CurrencyKey;
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
