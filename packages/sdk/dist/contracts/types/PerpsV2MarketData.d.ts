import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export declare namespace PerpsV2MarketData {
    type FeeRatesStruct = {
        takerFee: PromiseOrValue<BigNumberish>;
        makerFee: PromiseOrValue<BigNumberish>;
        takerFeeDelayedOrder: PromiseOrValue<BigNumberish>;
        makerFeeDelayedOrder: PromiseOrValue<BigNumberish>;
        takerFeeOffchainDelayedOrder: PromiseOrValue<BigNumberish>;
        makerFeeOffchainDelayedOrder: PromiseOrValue<BigNumberish>;
    };
    type FeeRatesStructOutput = [
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        takerFee: BigNumber;
        makerFee: BigNumber;
        takerFeeDelayedOrder: BigNumber;
        makerFeeDelayedOrder: BigNumber;
        takerFeeOffchainDelayedOrder: BigNumber;
        makerFeeOffchainDelayedOrder: BigNumber;
    };
    type MarketSummaryStruct = {
        market: PromiseOrValue<string>;
        asset: PromiseOrValue<BytesLike>;
        key: PromiseOrValue<BytesLike>;
        maxLeverage: PromiseOrValue<BigNumberish>;
        price: PromiseOrValue<BigNumberish>;
        marketSize: PromiseOrValue<BigNumberish>;
        marketSkew: PromiseOrValue<BigNumberish>;
        marketDebt: PromiseOrValue<BigNumberish>;
        currentFundingRate: PromiseOrValue<BigNumberish>;
        currentFundingVelocity: PromiseOrValue<BigNumberish>;
        feeRates: PerpsV2MarketData.FeeRatesStruct;
    };
    type MarketSummaryStructOutput = [
        string,
        string,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        PerpsV2MarketData.FeeRatesStructOutput
    ] & {
        market: string;
        asset: string;
        key: string;
        maxLeverage: BigNumber;
        price: BigNumber;
        marketSize: BigNumber;
        marketSkew: BigNumber;
        marketDebt: BigNumber;
        currentFundingRate: BigNumber;
        currentFundingVelocity: BigNumber;
        feeRates: PerpsV2MarketData.FeeRatesStructOutput;
    };
    type FuturesGlobalsStruct = {
        minInitialMargin: PromiseOrValue<BigNumberish>;
        liquidationFeeRatio: PromiseOrValue<BigNumberish>;
        minKeeperFee: PromiseOrValue<BigNumberish>;
        maxKeeperFee: PromiseOrValue<BigNumberish>;
    };
    type FuturesGlobalsStructOutput = [
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        minInitialMargin: BigNumber;
        liquidationFeeRatio: BigNumber;
        minKeeperFee: BigNumber;
        maxKeeperFee: BigNumber;
    };
    type MarketLimitsStruct = {
        maxLeverage: PromiseOrValue<BigNumberish>;
        maxMarketValue: PromiseOrValue<BigNumberish>;
    };
    type MarketLimitsStructOutput = [BigNumber, BigNumber] & {
        maxLeverage: BigNumber;
        maxMarketValue: BigNumber;
    };
    type FundingParametersStruct = {
        maxFundingVelocity: PromiseOrValue<BigNumberish>;
        skewScale: PromiseOrValue<BigNumberish>;
    };
    type FundingParametersStructOutput = [BigNumber, BigNumber] & {
        maxFundingVelocity: BigNumber;
        skewScale: BigNumber;
    };
    type SidesStruct = {
        long: PromiseOrValue<BigNumberish>;
        short: PromiseOrValue<BigNumberish>;
    };
    type SidesStructOutput = [BigNumber, BigNumber] & {
        long: BigNumber;
        short: BigNumber;
    };
    type MarketSizeDetailsStruct = {
        marketSize: PromiseOrValue<BigNumberish>;
        sides: PerpsV2MarketData.SidesStruct;
        marketDebt: PromiseOrValue<BigNumberish>;
        marketSkew: PromiseOrValue<BigNumberish>;
    };
    type MarketSizeDetailsStructOutput = [
        BigNumber,
        PerpsV2MarketData.SidesStructOutput,
        BigNumber,
        BigNumber
    ] & {
        marketSize: BigNumber;
        sides: PerpsV2MarketData.SidesStructOutput;
        marketDebt: BigNumber;
        marketSkew: BigNumber;
    };
    type PriceDetailsStruct = {
        price: PromiseOrValue<BigNumberish>;
        invalid: PromiseOrValue<boolean>;
    };
    type PriceDetailsStructOutput = [BigNumber, boolean] & {
        price: BigNumber;
        invalid: boolean;
    };
    type MarketDataStruct = {
        market: PromiseOrValue<string>;
        baseAsset: PromiseOrValue<BytesLike>;
        marketKey: PromiseOrValue<BytesLike>;
        feeRates: PerpsV2MarketData.FeeRatesStruct;
        limits: PerpsV2MarketData.MarketLimitsStruct;
        fundingParameters: PerpsV2MarketData.FundingParametersStruct;
        marketSizeDetails: PerpsV2MarketData.MarketSizeDetailsStruct;
        priceDetails: PerpsV2MarketData.PriceDetailsStruct;
    };
    type MarketDataStructOutput = [
        string,
        string,
        string,
        PerpsV2MarketData.FeeRatesStructOutput,
        PerpsV2MarketData.MarketLimitsStructOutput,
        PerpsV2MarketData.FundingParametersStructOutput,
        PerpsV2MarketData.MarketSizeDetailsStructOutput,
        PerpsV2MarketData.PriceDetailsStructOutput
    ] & {
        market: string;
        baseAsset: string;
        marketKey: string;
        feeRates: PerpsV2MarketData.FeeRatesStructOutput;
        limits: PerpsV2MarketData.MarketLimitsStructOutput;
        fundingParameters: PerpsV2MarketData.FundingParametersStructOutput;
        marketSizeDetails: PerpsV2MarketData.MarketSizeDetailsStructOutput;
        priceDetails: PerpsV2MarketData.PriceDetailsStructOutput;
    };
    type PositionDataStruct = {
        position: IPerpsV2MarketBaseTypes.PositionStruct;
        notionalValue: PromiseOrValue<BigNumberish>;
        profitLoss: PromiseOrValue<BigNumberish>;
        accruedFunding: PromiseOrValue<BigNumberish>;
        remainingMargin: PromiseOrValue<BigNumberish>;
        accessibleMargin: PromiseOrValue<BigNumberish>;
        liquidationPrice: PromiseOrValue<BigNumberish>;
        canLiquidatePosition: PromiseOrValue<boolean>;
    };
    type PositionDataStructOutput = [
        IPerpsV2MarketBaseTypes.PositionStructOutput,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        boolean
    ] & {
        position: IPerpsV2MarketBaseTypes.PositionStructOutput;
        notionalValue: BigNumber;
        profitLoss: BigNumber;
        accruedFunding: BigNumber;
        remainingMargin: BigNumber;
        accessibleMargin: BigNumber;
        liquidationPrice: BigNumber;
        canLiquidatePosition: boolean;
    };
}
export declare namespace IPerpsV2MarketSettings {
    type ParametersStruct = {
        takerFee: PromiseOrValue<BigNumberish>;
        makerFee: PromiseOrValue<BigNumberish>;
        takerFeeDelayedOrder: PromiseOrValue<BigNumberish>;
        makerFeeDelayedOrder: PromiseOrValue<BigNumberish>;
        takerFeeOffchainDelayedOrder: PromiseOrValue<BigNumberish>;
        makerFeeOffchainDelayedOrder: PromiseOrValue<BigNumberish>;
        maxLeverage: PromiseOrValue<BigNumberish>;
        maxMarketValue: PromiseOrValue<BigNumberish>;
        maxFundingVelocity: PromiseOrValue<BigNumberish>;
        skewScale: PromiseOrValue<BigNumberish>;
        nextPriceConfirmWindow: PromiseOrValue<BigNumberish>;
        delayedOrderConfirmWindow: PromiseOrValue<BigNumberish>;
        minDelayTimeDelta: PromiseOrValue<BigNumberish>;
        maxDelayTimeDelta: PromiseOrValue<BigNumberish>;
        offchainDelayedOrderMinAge: PromiseOrValue<BigNumberish>;
        offchainDelayedOrderMaxAge: PromiseOrValue<BigNumberish>;
        offchainMarketKey: PromiseOrValue<BytesLike>;
        offchainPriceDivergence: PromiseOrValue<BigNumberish>;
        liquidationPremiumMultiplier: PromiseOrValue<BigNumberish>;
        liquidationBufferRatio: PromiseOrValue<BigNumberish>;
        maxLiquidationDelta: PromiseOrValue<BigNumberish>;
        maxPD: PromiseOrValue<BigNumberish>;
    };
    type ParametersStructOutput = [
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        takerFee: BigNumber;
        makerFee: BigNumber;
        takerFeeDelayedOrder: BigNumber;
        makerFeeDelayedOrder: BigNumber;
        takerFeeOffchainDelayedOrder: BigNumber;
        makerFeeOffchainDelayedOrder: BigNumber;
        maxLeverage: BigNumber;
        maxMarketValue: BigNumber;
        maxFundingVelocity: BigNumber;
        skewScale: BigNumber;
        nextPriceConfirmWindow: BigNumber;
        delayedOrderConfirmWindow: BigNumber;
        minDelayTimeDelta: BigNumber;
        maxDelayTimeDelta: BigNumber;
        offchainDelayedOrderMinAge: BigNumber;
        offchainDelayedOrderMaxAge: BigNumber;
        offchainMarketKey: string;
        offchainPriceDivergence: BigNumber;
        liquidationPremiumMultiplier: BigNumber;
        liquidationBufferRatio: BigNumber;
        maxLiquidationDelta: BigNumber;
        maxPD: BigNumber;
    };
}
export declare namespace IPerpsV2MarketBaseTypes {
    type PositionStruct = {
        id: PromiseOrValue<BigNumberish>;
        lastFundingIndex: PromiseOrValue<BigNumberish>;
        margin: PromiseOrValue<BigNumberish>;
        lastPrice: PromiseOrValue<BigNumberish>;
        size: PromiseOrValue<BigNumberish>;
    };
    type PositionStructOutput = [
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        id: BigNumber;
        lastFundingIndex: BigNumber;
        margin: BigNumber;
        lastPrice: BigNumber;
        size: BigNumber;
    };
}
export interface PerpsV2MarketDataInterface extends utils.Interface {
    functions: {
        "allMarketSummaries()": FunctionFragment;
        "allProxiedMarketSummaries()": FunctionFragment;
        "globals()": FunctionFragment;
        "marketDetails(address)": FunctionFragment;
        "marketDetailsForKey(bytes32)": FunctionFragment;
        "marketSummaries(address[])": FunctionFragment;
        "marketSummariesForKeys(bytes32[])": FunctionFragment;
        "parameters(bytes32)": FunctionFragment;
        "positionDetails(address,address)": FunctionFragment;
        "positionDetailsForMarketKey(bytes32,address)": FunctionFragment;
        "resolverProxy()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "allMarketSummaries" | "allProxiedMarketSummaries" | "globals" | "marketDetails" | "marketDetailsForKey" | "marketSummaries" | "marketSummariesForKeys" | "parameters" | "positionDetails" | "positionDetailsForMarketKey" | "resolverProxy"): FunctionFragment;
    encodeFunctionData(functionFragment: "allMarketSummaries", values?: undefined): string;
    encodeFunctionData(functionFragment: "allProxiedMarketSummaries", values?: undefined): string;
    encodeFunctionData(functionFragment: "globals", values?: undefined): string;
    encodeFunctionData(functionFragment: "marketDetails", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "marketDetailsForKey", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "marketSummaries", values: [PromiseOrValue<string>[]]): string;
    encodeFunctionData(functionFragment: "marketSummariesForKeys", values: [PromiseOrValue<BytesLike>[]]): string;
    encodeFunctionData(functionFragment: "parameters", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "positionDetails", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "positionDetailsForMarketKey", values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "resolverProxy", values?: undefined): string;
    decodeFunctionResult(functionFragment: "allMarketSummaries", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "allProxiedMarketSummaries", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "globals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "marketDetails", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "marketDetailsForKey", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "marketSummaries", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "marketSummariesForKeys", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "parameters", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "positionDetails", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "positionDetailsForMarketKey", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resolverProxy", data: BytesLike): Result;
    events: {};
}
export interface PerpsV2MarketData extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: PerpsV2MarketDataInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        allMarketSummaries(overrides?: CallOverrides): Promise<[PerpsV2MarketData.MarketSummaryStructOutput[]]>;
        allProxiedMarketSummaries(overrides?: CallOverrides): Promise<[PerpsV2MarketData.MarketSummaryStructOutput[]]>;
        globals(overrides?: CallOverrides): Promise<[PerpsV2MarketData.FuturesGlobalsStructOutput]>;
        marketDetails(market: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[PerpsV2MarketData.MarketDataStructOutput]>;
        marketDetailsForKey(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[PerpsV2MarketData.MarketDataStructOutput]>;
        marketSummaries(markets: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<[PerpsV2MarketData.MarketSummaryStructOutput[]]>;
        marketSummariesForKeys(marketKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<[PerpsV2MarketData.MarketSummaryStructOutput[]]>;
        parameters(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[IPerpsV2MarketSettings.ParametersStructOutput]>;
        positionDetails(market: PromiseOrValue<string>, account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[PerpsV2MarketData.PositionDataStructOutput]>;
        positionDetailsForMarketKey(marketKey: PromiseOrValue<BytesLike>, account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[PerpsV2MarketData.PositionDataStructOutput]>;
        resolverProxy(overrides?: CallOverrides): Promise<[string]>;
    };
    allMarketSummaries(overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketSummaryStructOutput[]>;
    allProxiedMarketSummaries(overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketSummaryStructOutput[]>;
    globals(overrides?: CallOverrides): Promise<PerpsV2MarketData.FuturesGlobalsStructOutput>;
    marketDetails(market: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketDataStructOutput>;
    marketDetailsForKey(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketDataStructOutput>;
    marketSummaries(markets: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketSummaryStructOutput[]>;
    marketSummariesForKeys(marketKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketSummaryStructOutput[]>;
    parameters(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<IPerpsV2MarketSettings.ParametersStructOutput>;
    positionDetails(market: PromiseOrValue<string>, account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PerpsV2MarketData.PositionDataStructOutput>;
    positionDetailsForMarketKey(marketKey: PromiseOrValue<BytesLike>, account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PerpsV2MarketData.PositionDataStructOutput>;
    resolverProxy(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        allMarketSummaries(overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketSummaryStructOutput[]>;
        allProxiedMarketSummaries(overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketSummaryStructOutput[]>;
        globals(overrides?: CallOverrides): Promise<PerpsV2MarketData.FuturesGlobalsStructOutput>;
        marketDetails(market: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketDataStructOutput>;
        marketDetailsForKey(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketDataStructOutput>;
        marketSummaries(markets: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketSummaryStructOutput[]>;
        marketSummariesForKeys(marketKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<PerpsV2MarketData.MarketSummaryStructOutput[]>;
        parameters(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<IPerpsV2MarketSettings.ParametersStructOutput>;
        positionDetails(market: PromiseOrValue<string>, account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PerpsV2MarketData.PositionDataStructOutput>;
        positionDetailsForMarketKey(marketKey: PromiseOrValue<BytesLike>, account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PerpsV2MarketData.PositionDataStructOutput>;
        resolverProxy(overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        allMarketSummaries(overrides?: CallOverrides): Promise<BigNumber>;
        allProxiedMarketSummaries(overrides?: CallOverrides): Promise<BigNumber>;
        globals(overrides?: CallOverrides): Promise<BigNumber>;
        marketDetails(market: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        marketDetailsForKey(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        marketSummaries(markets: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<BigNumber>;
        marketSummariesForKeys(marketKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<BigNumber>;
        parameters(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        positionDetails(market: PromiseOrValue<string>, account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        positionDetailsForMarketKey(marketKey: PromiseOrValue<BytesLike>, account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        resolverProxy(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        allMarketSummaries(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        allProxiedMarketSummaries(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        globals(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        marketDetails(market: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        marketDetailsForKey(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        marketSummaries(markets: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        marketSummariesForKeys(marketKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        parameters(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        positionDetails(market: PromiseOrValue<string>, account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        positionDetailsForMarketKey(marketKey: PromiseOrValue<BytesLike>, account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        resolverProxy(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
