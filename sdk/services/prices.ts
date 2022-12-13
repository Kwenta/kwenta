import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { formatEther, parseBytes32String } from 'ethers/lib/utils.js';

import KwentaSDK from 'sdk';
import { MARKET_ASSETS_BY_PYTH_ID } from 'sdk/constants/futures';
import { ADDITIONAL_SYNTHS, PYTH_IDS } from 'sdk/constants/prices';
import { CurrencyRate, Prices, PricesMap, PriceType, SynthRatesTuple } from 'sdk/types/common';
import { FuturesMarketKey } from 'sdk/types/futures';
import { getPythNetworkUrl, normalizePythId } from 'sdk/utils/futures';
import { startInterval } from 'sdk/utils/interval';
import { scale } from 'utils/formatters/number';
import { MarketAssetByKey } from 'utils/futures';
import logError from 'utils/logError';

import * as sdkErrors from '../common/errors';

export default class PricesService {
	private sdk: KwentaSDK;
	private offChainPrices: PricesMap = {};
	private onChainPrices: PricesMap = {};
	private ratesInterval: number | undefined;
	private pyth: EvmPriceServiceConnection;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
		this.pyth = new EvmPriceServiceConnection(getPythNetworkUrl(sdk.context.networkId), {
			logger: console,
			timeout: 10000,
			verbose: true,
		});
		// TODO: Typed events
		this.sdk.context.events.on('network_changed', (params) => {
			this.pyth = new EvmPriceServiceConnection(getPythNetworkUrl(params.networkId), {
				logger: console,
			});
			this.pyth.onWsError = (error) => {
				console.log('err', error);
			};
		});
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

		// Fetch and then subscribe to Pyth off-chain prices
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
			this.sdk.context.events.emit('prices_updated', {
				prices: this.offChainPrices,
				type: 'off_chain',
			});
		});
	}

	public onPricesUpdated(
		listener: (updatedPrices: { type: PriceType; prices: PricesMap }) => void
	) {
		return this.sdk.context.events.on('prices_updated', listener);
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
}
