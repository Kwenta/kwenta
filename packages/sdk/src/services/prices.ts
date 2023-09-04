import { parseBytes32String } from '@ethersproject/strings'
import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js'
import Wei, { wei } from '@synthetixio/wei'
import { formatEther } from 'ethers/lib/utils.js'
import request, { gql } from 'graphql-request'
import { throttle } from 'lodash'

import KwentaSDK from '..'
import * as sdkErrors from '../common/errors'
import { MARKETS, MARKET_ASSETS_BY_PYTH_ID } from '../constants/futures'
import { PERIOD_IN_SECONDS } from '../constants/period'
import { PRICE_UPDATE_THROTTLE, PYTH_IDS } from '../constants/prices'
import { NetworkId, PriceServer } from '../types/common'
import { FuturesMarketKey } from '../types/futures'
import { SynthPrice, PricesListener, PricesMap, SynthPricesTuple } from '../types/prices'
import {
	getDisplayAsset,
	getPythNetworkUrl,
	normalizePythId,
	MarketAssetByKey,
} from '../utils/futures'
import { startInterval } from '../utils/interval'
import { scale } from '../utils/number'
import { getRatesEndpoint } from '../utils/prices'
import { PerpsV2MarketData } from '../contracts/types'

const DEBUG_WS = false
const LOG_WS = process.env.NODE_ENV !== 'production' && DEBUG_WS
const DEFAULT_PRICE_SERVER =
	process.env.NEXT_PUBLIC_DEFAULT_PRICE_SERVICE === 'KWENTA' ? 'KWENTA' : 'PYTH'

export default class PricesService {
	private sdk: KwentaSDK
	private offChainPrices: PricesMap = {}
	private onChainPrices: PricesMap = {}
	private ratesInterval?: ReturnType<typeof setInterval>
	private pyth!: EvmPriceServiceConnection
	private lastConnectionTime: number = Date.now()
	private wsConnected: boolean = false
	private server: PriceServer = DEFAULT_PRICE_SERVER
	private connectionMonitorId?: ReturnType<typeof setTimeout>

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
		this.setEventListeners()
		this.connectToPyth(sdk.context.networkId, this.server)
	}

	get currentPrices() {
		return {
			onChain: this.onChainPrices,
			offChain: this.offChainPrices,
		}
	}

	get pythIds() {
		return this.sdk.context.isMainnet ? PYTH_IDS.mainnet : PYTH_IDS.testnet
	}

	/**
	 * @desc Get offchain price for a given market
	 * @param marketKey - Futures market key
	 * @returns Offchain price for specified market
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK();
	 * const price = sdk.prices.getOffchainPrice(FuturesMarketKey.sBTCPERP);
	 * console.log(price);
	 * ```
	 */
	public getOffchainPrice(marketKey: FuturesMarketKey) {
		const price = this.offChainPrices[MarketAssetByKey[marketKey]]
		if (!price) throw new Error(`No price data for ${marketKey}`)
		return price
	}

	/**
	 * @desc Start polling pyth price updates
	 * @param intervalTime - Polling interval in milliseconds
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK();
	 * await sdk.prices.startPriceUpdates(10000);
	 * ```
	 */
	public async startPriceUpdates(intervalTime: number) {
		// Poll the onchain prices
		if (!this.ratesInterval) {
			this.ratesInterval = startInterval(async () => {
				try {
					this.onChainPrices = await this.getOnChainPrices()
					this.sdk.context.events.emit('prices_updated', {
						prices: this.onChainPrices,
						type: 'on_chain',
					})
				} catch (err) {
					this.sdk.context.logError(err)
				}
			}, intervalTime)
		}
	}

	public onPricesUpdated(listener: PricesListener) {
		return this.sdk.context.events.on('prices_updated', listener)
	}

	public removePricesListener(listener: PricesListener) {
		return this.sdk.context.events.off('prices_updated', listener)
	}

	public removePricesListeners() {
		this.sdk.context.events.removeAllListeners('prices_updated')
	}

	public onPricesConnectionUpdated(
		listener: (status: { connected: boolean; error?: Error | undefined }) => void
	) {
		return this.sdk.context.events.on('prices_connection_update', listener)
	}

	public removeConnectionListeners() {
		this.sdk.context.events.removeAllListeners('prices_connection_update')
	}

	public async getOnChainPrices() {
		if (
			!this.sdk.context.multicallContracts.SynthUtil ||
			!this.sdk.context.multicallContracts.PerpsV2MarketData
		) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const synthPrices: Record<string, Wei> = {}

		const [synthsRates, perpsMarkets] = (await this.sdk.context.multicallProvider.all([
			this.sdk.context.multicallContracts.SynthUtil.synthsRates(),
			this.sdk.context.multicallContracts.PerpsV2MarketData.allProxiedMarketSummaries(),
		])) as [SynthPricesTuple, PerpsV2MarketData.MarketSummaryStructOutput[]]

		const synths = synthsRates[0]
		const synthRates = synthsRates[1]

		synths.forEach((currencyKeyBytes32, i) => {
			const currencyKey = parseBytes32String(currencyKeyBytes32)
			const marketAsset = MarketAssetByKey[currencyKey as FuturesMarketKey]

			const rate = Number(formatEther(synthRates[i]))
			const price = wei(rate)

			synthPrices[currencyKey] = price
			if (marketAsset) synthPrices[marketAsset] = price
		})

		perpsMarkets.forEach((market) => {
			const marketAsset = parseBytes32String(market.asset)
			const price = wei(market.price)
			if (marketAsset) synthPrices[marketAsset] = price
		})

		return synthPrices
	}

	public async getOffChainPrices() {
		const pythPrices = await this.pyth.getLatestPriceFeeds(this.pythIds)
		return this.formatOffChainPrices(pythPrices ?? [])
	}

	public async getPreviousDayPrices(marketAssets: string[], networkId?: NetworkId) {
		const ratesEndpoint = getRatesEndpoint(networkId || this.sdk.context.networkId)
		const minTimestamp = Math.floor((Date.now() - PERIOD_IN_SECONDS.ONE_DAY * 1000) / 1000)

		const rateUpdateQueries = marketAssets.map((asset) => {
			return gql`
			# last before timestamp
			${asset}: rateUpdates(
				first: 1
				where: { synth: "${getDisplayAsset(asset)?.toUpperCase() ?? asset}", timestamp_gte: $minTimestamp }
				orderBy: timestamp
				orderDirection: asc
			) {
				synth
				rate
			}
		`
		})

		const response = await request(
			ratesEndpoint,
			gql`
				query rateUpdates($minTimestamp: BigInt!) {
					${rateUpdateQueries.reduce((acc: string, curr: string) => {
						return acc + curr
					})}
			}`,
			{
				minTimestamp: minTimestamp,
			}
		)
		return (response ? Object.values(response).flat() : []) as SynthPrice[]
	}

	/**
	 * @desc Get pyth price update data for a given market
	 * @param marketKey Futures market key
	 * @returns Pyth price update data
	 */
	public async getPythPriceUpdateData(marketKey: FuturesMarketKey) {
		const pythIds = MARKETS[marketKey]?.pythIds
		const pythId = pythIds ? pythIds[this.sdk.context.isMainnet ? 'mainnet' : 'testnet'] : null
		if (!pythId) throw new Error(sdkErrors.NO_PYTH_ID)

		const updateData = await this.pyth.getPriceFeedsUpdateData([pythId])
		return updateData
	}

	private formatOffChainPrices(pythPrices: PriceFeed[]) {
		const offChainPrices =
			pythPrices?.reduce<Record<string, Wei>>((acc, p) => {
				const price = this.formatPythPrice(p)
				// Have to handle inconsistent id formatting between ws and http
				const id = normalizePythId(p.id)
				const marketKey = MARKET_ASSETS_BY_PYTH_ID[id]
				if (marketKey) {
					acc[marketKey] = price
				}
				return acc
			}, {}) ?? {}
		return offChainPrices
	}

	private connectToPyth(networkId: NetworkId, server: PriceServer) {
		if (this.pyth) {
			this.pyth.closeWebSocket()
		}

		this.pyth = new EvmPriceServiceConnection(getPythNetworkUrl(networkId, server), {
			logger: LOG_WS ? console : undefined,
		})
		this.lastConnectionTime = Date.now()
		this.monitorConnection()

		this.pyth.onWsError = (error: Error) => {
			if (error?.message) {
				this.sdk.context.logError(error)
			}
			this.setWsConnected(false)
			this.sdk.context.events.emit('prices_connection_update', {
				connected: false,
				error: error || new Error('pyth prices ws connection failed'),
			})
		}

		this.subscribeToPythPriceUpdates()
	}

	private setWsConnected(connected: boolean) {
		if (connected !== this.wsConnected) {
			this.wsConnected = connected
			this.sdk.context.events.emit('prices_connection_update', {
				connected: connected,
			})
		}
	}

	private setEventListeners() {
		this.sdk.context.events.on('network_changed', (params) => {
			this.connectToPyth(params.networkId, this.server)
		})
	}

	private monitorConnection() {
		// Should get a constant stream of messages so when we don't
		// receive any for a 10 second period we switch servers
		if (this.connectionMonitorId) clearTimeout(this.connectionMonitorId)
		this.connectionMonitorId = setTimeout(() => {
			if (Date.now() - this.lastConnectionTime > 10000) {
				this.switchConnection()
			}
			this.monitorConnection()
		}, 1000)
	}

	private switchConnection() {
		this.server = this.server === 'KWENTA' ? 'PYTH' : 'KWENTA'
		this.connectToPyth(this.sdk.context.networkId, this.server)
	}

	private formatPythPrice(priceFeed: PriceFeed): Wei {
		const price = priceFeed.getPriceUnchecked()
		return scale(wei(price.price), price.expo)
	}

	throttleOffChainPricesUpdate = throttle((offChainPrices: PricesMap) => {
		this.sdk.context.events.emit('prices_updated', {
			prices: offChainPrices,
			type: 'off_chain',
			source: 'stream',
		})
	}, PRICE_UPDATE_THROTTLE)

	private async subscribeToPythPriceUpdates() {
		try {
			this.offChainPrices = await this.getOffChainPrices()
			this.sdk.context.events.emit('prices_updated', {
				prices: this.offChainPrices,
				type: 'off_chain',
				source: 'fetch',
			})
		} catch (err) {
			this.sdk.context.logError(err)
		}
		this.pyth.subscribePriceFeedUpdates(this.pythIds, (priceFeed) => {
			const id = normalizePythId(priceFeed.id)
			const assetKey = MARKET_ASSETS_BY_PYTH_ID[id]
			if (assetKey) {
				const price = this.formatPythPrice(priceFeed)
				this.offChainPrices[assetKey] = price
			}
			this.setWsConnected(true)
			this.lastConnectionTime = Date.now()
			this.throttleOffChainPricesUpdate(this.offChainPrices)
		})
	}
}
