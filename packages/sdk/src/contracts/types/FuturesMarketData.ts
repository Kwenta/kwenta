/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
	BaseContract,
	BigNumber,
	BigNumberish,
	BytesLike,
	CallOverrides,
	PopulatedTransaction,
	Signer,
	utils,
} from 'ethers'
import type { FunctionFragment, Result } from '@ethersproject/abi'
import type { Listener, Provider } from '@ethersproject/providers'
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from './common'

export declare namespace FuturesMarketData {
	export type FeeRatesStruct = {
		takerFee: BigNumberish
		makerFee: BigNumberish
		takerFeeNextPrice: BigNumberish
		makerFeeNextPrice: BigNumberish
	}

	export type FeeRatesStructOutput = [BigNumber, BigNumber, BigNumber, BigNumber] & {
		takerFee: BigNumber
		makerFee: BigNumber
		takerFeeNextPrice: BigNumber
		makerFeeNextPrice: BigNumber
	}

	export type MarketSummaryStruct = {
		market: string
		asset: BytesLike
		key: BytesLike
		maxLeverage: BigNumberish
		price: BigNumberish
		marketSize: BigNumberish
		marketSkew: BigNumberish
		marketDebt: BigNumberish
		currentFundingRate: BigNumberish
		feeRates: FuturesMarketData.FeeRatesStruct
	}

	export type MarketSummaryStructOutput = [
		string,
		string,
		string,
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber,
		FuturesMarketData.FeeRatesStructOutput
	] & {
		market: string
		asset: string
		key: string
		maxLeverage: BigNumber
		price: BigNumber
		marketSize: BigNumber
		marketSkew: BigNumber
		marketDebt: BigNumber
		currentFundingRate: BigNumber
		feeRates: FuturesMarketData.FeeRatesStructOutput
	}

	export type FuturesGlobalsStruct = {
		minInitialMargin: BigNumberish
		liquidationFeeRatio: BigNumberish
		liquidationBufferRatio: BigNumberish
		minKeeperFee: BigNumberish
	}

	export type FuturesGlobalsStructOutput = [BigNumber, BigNumber, BigNumber, BigNumber] & {
		minInitialMargin: BigNumber
		liquidationFeeRatio: BigNumber
		liquidationBufferRatio: BigNumber
		minKeeperFee: BigNumber
	}

	export type MarketLimitsStruct = {
		maxLeverage: BigNumberish
		maxMarketValueUSD: BigNumberish
	}

	export type MarketLimitsStructOutput = [BigNumber, BigNumber] & {
		maxLeverage: BigNumber
		maxMarketValueUSD: BigNumber
	}

	export type FundingParametersStruct = {
		maxFundingRate: BigNumberish
		skewScaleUSD: BigNumberish
	}

	export type FundingParametersStructOutput = [BigNumber, BigNumber] & {
		maxFundingRate: BigNumber
		skewScaleUSD: BigNumber
	}

	export type SidesStruct = { long: BigNumberish; short: BigNumberish }

	export type SidesStructOutput = [BigNumber, BigNumber] & {
		long: BigNumber
		short: BigNumber
	}

	export type MarketSizeDetailsStruct = {
		marketSize: BigNumberish
		sides: FuturesMarketData.SidesStruct
		marketDebt: BigNumberish
		marketSkew: BigNumberish
	}

	export type MarketSizeDetailsStructOutput = [
		BigNumber,
		FuturesMarketData.SidesStructOutput,
		BigNumber,
		BigNumber
	] & {
		marketSize: BigNumber
		sides: FuturesMarketData.SidesStructOutput
		marketDebt: BigNumber
		marketSkew: BigNumber
	}

	export type PriceDetailsStruct = { price: BigNumberish; invalid: boolean }

	export type PriceDetailsStructOutput = [BigNumber, boolean] & {
		price: BigNumber
		invalid: boolean
	}

	export type MarketDataStruct = {
		market: string
		baseAsset: BytesLike
		marketKey: BytesLike
		feeRates: FuturesMarketData.FeeRatesStruct
		limits: FuturesMarketData.MarketLimitsStruct
		fundingParameters: FuturesMarketData.FundingParametersStruct
		marketSizeDetails: FuturesMarketData.MarketSizeDetailsStruct
		priceDetails: FuturesMarketData.PriceDetailsStruct
	}

	export type MarketDataStructOutput = [
		string,
		string,
		string,
		FuturesMarketData.FeeRatesStructOutput,
		FuturesMarketData.MarketLimitsStructOutput,
		FuturesMarketData.FundingParametersStructOutput,
		FuturesMarketData.MarketSizeDetailsStructOutput,
		FuturesMarketData.PriceDetailsStructOutput
	] & {
		market: string
		baseAsset: string
		marketKey: string
		feeRates: FuturesMarketData.FeeRatesStructOutput
		limits: FuturesMarketData.MarketLimitsStructOutput
		fundingParameters: FuturesMarketData.FundingParametersStructOutput
		marketSizeDetails: FuturesMarketData.MarketSizeDetailsStructOutput
		priceDetails: FuturesMarketData.PriceDetailsStructOutput
	}

	export type PositionDataStruct = {
		position: IFuturesMarketBaseTypes.PositionStruct
		notionalValue: BigNumberish
		profitLoss: BigNumberish
		accruedFunding: BigNumberish
		remainingMargin: BigNumberish
		accessibleMargin: BigNumberish
		liquidationPrice: BigNumberish
		canLiquidatePosition: boolean
	}

	export type PositionDataStructOutput = [
		IFuturesMarketBaseTypes.PositionStructOutput,
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber,
		boolean
	] & {
		position: IFuturesMarketBaseTypes.PositionStructOutput
		notionalValue: BigNumber
		profitLoss: BigNumber
		accruedFunding: BigNumber
		remainingMargin: BigNumber
		accessibleMargin: BigNumber
		liquidationPrice: BigNumber
		canLiquidatePosition: boolean
	}
}

export declare namespace IFuturesMarketSettings {
	export type ParametersStruct = {
		takerFee: BigNumberish
		makerFee: BigNumberish
		takerFeeNextPrice: BigNumberish
		makerFeeNextPrice: BigNumberish
		nextPriceConfirmWindow: BigNumberish
		maxLeverage: BigNumberish
		maxMarketValueUSD: BigNumberish
		maxFundingRate: BigNumberish
		skewScaleUSD: BigNumberish
	}

	export type ParametersStructOutput = [
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber,
		BigNumber
	] & {
		takerFee: BigNumber
		makerFee: BigNumber
		takerFeeNextPrice: BigNumber
		makerFeeNextPrice: BigNumber
		nextPriceConfirmWindow: BigNumber
		maxLeverage: BigNumber
		maxMarketValueUSD: BigNumber
		maxFundingRate: BigNumber
		skewScaleUSD: BigNumber
	}
}

export declare namespace IFuturesMarketBaseTypes {
	export type PositionStruct = {
		id: BigNumberish
		lastFundingIndex: BigNumberish
		margin: BigNumberish
		lastPrice: BigNumberish
		size: BigNumberish
	}

	export type PositionStructOutput = [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
		id: BigNumber
		lastFundingIndex: BigNumber
		margin: BigNumber
		lastPrice: BigNumber
		size: BigNumber
	}
}

export interface FuturesMarketDataInterface extends utils.Interface {
	functions: {
		'allMarketSummaries()': FunctionFragment
		'globals()': FunctionFragment
		'marketDetails(address)': FunctionFragment
		'marketDetailsForKey(bytes32)': FunctionFragment
		'marketSummaries(address[])': FunctionFragment
		'marketSummariesForKeys(bytes32[])': FunctionFragment
		'parameters(bytes32)': FunctionFragment
		'positionDetails(address,address)': FunctionFragment
		'positionDetailsForMarketKey(bytes32,address)': FunctionFragment
		'resolverProxy()': FunctionFragment
	}

	getFunction(
		nameOrSignatureOrTopic:
			| 'allMarketSummaries'
			| 'globals'
			| 'marketDetails'
			| 'marketDetailsForKey'
			| 'marketSummaries'
			| 'marketSummariesForKeys'
			| 'parameters'
			| 'positionDetails'
			| 'positionDetailsForMarketKey'
			| 'resolverProxy'
	): FunctionFragment

	encodeFunctionData(functionFragment: 'allMarketSummaries', values?: undefined): string
	encodeFunctionData(functionFragment: 'globals', values?: undefined): string
	encodeFunctionData(functionFragment: 'marketDetails', values: [string]): string
	encodeFunctionData(functionFragment: 'marketDetailsForKey', values: [BytesLike]): string
	encodeFunctionData(functionFragment: 'marketSummaries', values: [string[]]): string
	encodeFunctionData(functionFragment: 'marketSummariesForKeys', values: [BytesLike[]]): string
	encodeFunctionData(functionFragment: 'parameters', values: [BytesLike]): string
	encodeFunctionData(functionFragment: 'positionDetails', values: [string, string]): string
	encodeFunctionData(
		functionFragment: 'positionDetailsForMarketKey',
		values: [BytesLike, string]
	): string
	encodeFunctionData(functionFragment: 'resolverProxy', values?: undefined): string

	decodeFunctionResult(functionFragment: 'allMarketSummaries', data: BytesLike): Result
	decodeFunctionResult(functionFragment: 'globals', data: BytesLike): Result
	decodeFunctionResult(functionFragment: 'marketDetails', data: BytesLike): Result
	decodeFunctionResult(functionFragment: 'marketDetailsForKey', data: BytesLike): Result
	decodeFunctionResult(functionFragment: 'marketSummaries', data: BytesLike): Result
	decodeFunctionResult(functionFragment: 'marketSummariesForKeys', data: BytesLike): Result
	decodeFunctionResult(functionFragment: 'parameters', data: BytesLike): Result
	decodeFunctionResult(functionFragment: 'positionDetails', data: BytesLike): Result
	decodeFunctionResult(functionFragment: 'positionDetailsForMarketKey', data: BytesLike): Result
	decodeFunctionResult(functionFragment: 'resolverProxy', data: BytesLike): Result

	events: {}
}

export interface FuturesMarketData extends BaseContract {
	connect(signerOrProvider: Signer | Provider | string): this
	attach(addressOrName: string): this
	deployed(): Promise<this>

	interface: FuturesMarketDataInterface

	queryFilter<TEvent extends TypedEvent>(
		event: TypedEventFilter<TEvent>,
		fromBlockOrBlockhash?: string | number | undefined,
		toBlock?: string | number | undefined
	): Promise<Array<TEvent>>

	listeners<TEvent extends TypedEvent>(
		eventFilter?: TypedEventFilter<TEvent>
	): Array<TypedListener<TEvent>>
	listeners(eventName?: string): Array<Listener>
	removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this
	removeAllListeners(eventName?: string): this
	off: OnEvent<this>
	on: OnEvent<this>
	once: OnEvent<this>
	removeListener: OnEvent<this>

	functions: {
		allMarketSummaries(
			overrides?: CallOverrides
		): Promise<[FuturesMarketData.MarketSummaryStructOutput[]]>

		globals(overrides?: CallOverrides): Promise<[FuturesMarketData.FuturesGlobalsStructOutput]>

		marketDetails(
			market: string,
			overrides?: CallOverrides
		): Promise<[FuturesMarketData.MarketDataStructOutput]>

		marketDetailsForKey(
			marketKey: BytesLike,
			overrides?: CallOverrides
		): Promise<[FuturesMarketData.MarketDataStructOutput]>

		marketSummaries(
			markets: string[],
			overrides?: CallOverrides
		): Promise<[FuturesMarketData.MarketSummaryStructOutput[]]>

		marketSummariesForKeys(
			marketKeys: BytesLike[],
			overrides?: CallOverrides
		): Promise<[FuturesMarketData.MarketSummaryStructOutput[]]>

		parameters(
			marketKey: BytesLike,
			overrides?: CallOverrides
		): Promise<[IFuturesMarketSettings.ParametersStructOutput]>

		positionDetails(
			market: string,
			account: string,
			overrides?: CallOverrides
		): Promise<[FuturesMarketData.PositionDataStructOutput]>

		positionDetailsForMarketKey(
			marketKey: BytesLike,
			account: string,
			overrides?: CallOverrides
		): Promise<[FuturesMarketData.PositionDataStructOutput]>

		resolverProxy(overrides?: CallOverrides): Promise<[string]>
	}

	allMarketSummaries(
		overrides?: CallOverrides
	): Promise<FuturesMarketData.MarketSummaryStructOutput[]>

	globals(overrides?: CallOverrides): Promise<FuturesMarketData.FuturesGlobalsStructOutput>

	marketDetails(
		market: string,
		overrides?: CallOverrides
	): Promise<FuturesMarketData.MarketDataStructOutput>

	marketDetailsForKey(
		marketKey: BytesLike,
		overrides?: CallOverrides
	): Promise<FuturesMarketData.MarketDataStructOutput>

	marketSummaries(
		markets: string[],
		overrides?: CallOverrides
	): Promise<FuturesMarketData.MarketSummaryStructOutput[]>

	marketSummariesForKeys(
		marketKeys: BytesLike[],
		overrides?: CallOverrides
	): Promise<FuturesMarketData.MarketSummaryStructOutput[]>

	parameters(
		marketKey: BytesLike,
		overrides?: CallOverrides
	): Promise<IFuturesMarketSettings.ParametersStructOutput>

	positionDetails(
		market: string,
		account: string,
		overrides?: CallOverrides
	): Promise<FuturesMarketData.PositionDataStructOutput>

	positionDetailsForMarketKey(
		marketKey: BytesLike,
		account: string,
		overrides?: CallOverrides
	): Promise<FuturesMarketData.PositionDataStructOutput>

	resolverProxy(overrides?: CallOverrides): Promise<string>

	callStatic: {
		allMarketSummaries(
			overrides?: CallOverrides
		): Promise<FuturesMarketData.MarketSummaryStructOutput[]>

		globals(overrides?: CallOverrides): Promise<FuturesMarketData.FuturesGlobalsStructOutput>

		marketDetails(
			market: string,
			overrides?: CallOverrides
		): Promise<FuturesMarketData.MarketDataStructOutput>

		marketDetailsForKey(
			marketKey: BytesLike,
			overrides?: CallOverrides
		): Promise<FuturesMarketData.MarketDataStructOutput>

		marketSummaries(
			markets: string[],
			overrides?: CallOverrides
		): Promise<FuturesMarketData.MarketSummaryStructOutput[]>

		marketSummariesForKeys(
			marketKeys: BytesLike[],
			overrides?: CallOverrides
		): Promise<FuturesMarketData.MarketSummaryStructOutput[]>

		parameters(
			marketKey: BytesLike,
			overrides?: CallOverrides
		): Promise<IFuturesMarketSettings.ParametersStructOutput>

		positionDetails(
			market: string,
			account: string,
			overrides?: CallOverrides
		): Promise<FuturesMarketData.PositionDataStructOutput>

		positionDetailsForMarketKey(
			marketKey: BytesLike,
			account: string,
			overrides?: CallOverrides
		): Promise<FuturesMarketData.PositionDataStructOutput>

		resolverProxy(overrides?: CallOverrides): Promise<string>
	}

	filters: {}

	estimateGas: {
		allMarketSummaries(overrides?: CallOverrides): Promise<BigNumber>

		globals(overrides?: CallOverrides): Promise<BigNumber>

		marketDetails(market: string, overrides?: CallOverrides): Promise<BigNumber>

		marketDetailsForKey(marketKey: BytesLike, overrides?: CallOverrides): Promise<BigNumber>

		marketSummaries(markets: string[], overrides?: CallOverrides): Promise<BigNumber>

		marketSummariesForKeys(marketKeys: BytesLike[], overrides?: CallOverrides): Promise<BigNumber>

		parameters(marketKey: BytesLike, overrides?: CallOverrides): Promise<BigNumber>

		positionDetails(market: string, account: string, overrides?: CallOverrides): Promise<BigNumber>

		positionDetailsForMarketKey(
			marketKey: BytesLike,
			account: string,
			overrides?: CallOverrides
		): Promise<BigNumber>

		resolverProxy(overrides?: CallOverrides): Promise<BigNumber>
	}

	populateTransaction: {
		allMarketSummaries(overrides?: CallOverrides): Promise<PopulatedTransaction>

		globals(overrides?: CallOverrides): Promise<PopulatedTransaction>

		marketDetails(market: string, overrides?: CallOverrides): Promise<PopulatedTransaction>

		marketDetailsForKey(
			marketKey: BytesLike,
			overrides?: CallOverrides
		): Promise<PopulatedTransaction>

		marketSummaries(markets: string[], overrides?: CallOverrides): Promise<PopulatedTransaction>

		marketSummariesForKeys(
			marketKeys: BytesLike[],
			overrides?: CallOverrides
		): Promise<PopulatedTransaction>

		parameters(marketKey: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>

		positionDetails(
			market: string,
			account: string,
			overrides?: CallOverrides
		): Promise<PopulatedTransaction>

		positionDetailsForMarketKey(
			marketKey: BytesLike,
			account: string,
			overrides?: CallOverrides
		): Promise<PopulatedTransaction>

		resolverProxy(overrides?: CallOverrides): Promise<PopulatedTransaction>
	}
}
