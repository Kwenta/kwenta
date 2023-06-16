import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export interface SystemStatusInterface extends utils.Interface {
    functions: {
        "CONTRACT_NAME()": FunctionFragment;
        "SECTION_EXCHANGE()": FunctionFragment;
        "SECTION_FUTURES()": FunctionFragment;
        "SECTION_ISSUANCE()": FunctionFragment;
        "SECTION_SYNTH()": FunctionFragment;
        "SECTION_SYNTH_EXCHANGE()": FunctionFragment;
        "SECTION_SYSTEM()": FunctionFragment;
        "SUSPENSION_REASON_UPGRADE()": FunctionFragment;
        "acceptOwnership()": FunctionFragment;
        "accessControl(bytes32,address)": FunctionFragment;
        "exchangeSuspension()": FunctionFragment;
        "futuresMarketSuspension(bytes32)": FunctionFragment;
        "futuresSuspension()": FunctionFragment;
        "getFuturesMarketSuspensions(bytes32[])": FunctionFragment;
        "getSynthExchangeSuspensions(bytes32[])": FunctionFragment;
        "getSynthSuspensions(bytes32[])": FunctionFragment;
        "isSystemUpgrading()": FunctionFragment;
        "issuanceSuspension()": FunctionFragment;
        "nominateNewOwner(address)": FunctionFragment;
        "nominatedOwner()": FunctionFragment;
        "owner()": FunctionFragment;
        "requireExchangeActive()": FunctionFragment;
        "requireExchangeBetweenSynthsAllowed(bytes32,bytes32)": FunctionFragment;
        "requireFuturesActive()": FunctionFragment;
        "requireFuturesMarketActive(bytes32)": FunctionFragment;
        "requireIssuanceActive()": FunctionFragment;
        "requireSynthActive(bytes32)": FunctionFragment;
        "requireSynthExchangeActive(bytes32)": FunctionFragment;
        "requireSynthsActive(bytes32,bytes32)": FunctionFragment;
        "requireSystemActive()": FunctionFragment;
        "resumeExchange()": FunctionFragment;
        "resumeFutures()": FunctionFragment;
        "resumeFuturesMarket(bytes32)": FunctionFragment;
        "resumeFuturesMarkets(bytes32[])": FunctionFragment;
        "resumeIssuance()": FunctionFragment;
        "resumeSynth(bytes32)": FunctionFragment;
        "resumeSynthExchange(bytes32)": FunctionFragment;
        "resumeSynths(bytes32[])": FunctionFragment;
        "resumeSynthsExchange(bytes32[])": FunctionFragment;
        "resumeSystem()": FunctionFragment;
        "suspendExchange(uint256)": FunctionFragment;
        "suspendFutures(uint256)": FunctionFragment;
        "suspendFuturesMarket(bytes32,uint256)": FunctionFragment;
        "suspendFuturesMarkets(bytes32[],uint256)": FunctionFragment;
        "suspendIssuance(uint256)": FunctionFragment;
        "suspendSynth(bytes32,uint256)": FunctionFragment;
        "suspendSynthExchange(bytes32,uint256)": FunctionFragment;
        "suspendSynths(bytes32[],uint256)": FunctionFragment;
        "suspendSynthsExchange(bytes32[],uint256)": FunctionFragment;
        "suspendSystem(uint256)": FunctionFragment;
        "synthExchangeSuspension(bytes32)": FunctionFragment;
        "synthSuspended(bytes32)": FunctionFragment;
        "synthSuspension(bytes32)": FunctionFragment;
        "systemSuspended()": FunctionFragment;
        "systemSuspension()": FunctionFragment;
        "updateAccessControl(bytes32,address,bool,bool)": FunctionFragment;
        "updateAccessControls(bytes32[],address[],bool[],bool[])": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "CONTRACT_NAME" | "SECTION_EXCHANGE" | "SECTION_FUTURES" | "SECTION_ISSUANCE" | "SECTION_SYNTH" | "SECTION_SYNTH_EXCHANGE" | "SECTION_SYSTEM" | "SUSPENSION_REASON_UPGRADE" | "acceptOwnership" | "accessControl" | "exchangeSuspension" | "futuresMarketSuspension" | "futuresSuspension" | "getFuturesMarketSuspensions" | "getSynthExchangeSuspensions" | "getSynthSuspensions" | "isSystemUpgrading" | "issuanceSuspension" | "nominateNewOwner" | "nominatedOwner" | "owner" | "requireExchangeActive" | "requireExchangeBetweenSynthsAllowed" | "requireFuturesActive" | "requireFuturesMarketActive" | "requireIssuanceActive" | "requireSynthActive" | "requireSynthExchangeActive" | "requireSynthsActive" | "requireSystemActive" | "resumeExchange" | "resumeFutures" | "resumeFuturesMarket" | "resumeFuturesMarkets" | "resumeIssuance" | "resumeSynth" | "resumeSynthExchange" | "resumeSynths" | "resumeSynthsExchange" | "resumeSystem" | "suspendExchange" | "suspendFutures" | "suspendFuturesMarket" | "suspendFuturesMarkets" | "suspendIssuance" | "suspendSynth" | "suspendSynthExchange" | "suspendSynths" | "suspendSynthsExchange" | "suspendSystem" | "synthExchangeSuspension" | "synthSuspended" | "synthSuspension" | "systemSuspended" | "systemSuspension" | "updateAccessControl" | "updateAccessControls"): FunctionFragment;
    encodeFunctionData(functionFragment: "CONTRACT_NAME", values?: undefined): string;
    encodeFunctionData(functionFragment: "SECTION_EXCHANGE", values?: undefined): string;
    encodeFunctionData(functionFragment: "SECTION_FUTURES", values?: undefined): string;
    encodeFunctionData(functionFragment: "SECTION_ISSUANCE", values?: undefined): string;
    encodeFunctionData(functionFragment: "SECTION_SYNTH", values?: undefined): string;
    encodeFunctionData(functionFragment: "SECTION_SYNTH_EXCHANGE", values?: undefined): string;
    encodeFunctionData(functionFragment: "SECTION_SYSTEM", values?: undefined): string;
    encodeFunctionData(functionFragment: "SUSPENSION_REASON_UPGRADE", values?: undefined): string;
    encodeFunctionData(functionFragment: "acceptOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "accessControl", values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "exchangeSuspension", values?: undefined): string;
    encodeFunctionData(functionFragment: "futuresMarketSuspension", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "futuresSuspension", values?: undefined): string;
    encodeFunctionData(functionFragment: "getFuturesMarketSuspensions", values: [PromiseOrValue<BytesLike>[]]): string;
    encodeFunctionData(functionFragment: "getSynthExchangeSuspensions", values: [PromiseOrValue<BytesLike>[]]): string;
    encodeFunctionData(functionFragment: "getSynthSuspensions", values: [PromiseOrValue<BytesLike>[]]): string;
    encodeFunctionData(functionFragment: "isSystemUpgrading", values?: undefined): string;
    encodeFunctionData(functionFragment: "issuanceSuspension", values?: undefined): string;
    encodeFunctionData(functionFragment: "nominateNewOwner", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "nominatedOwner", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "requireExchangeActive", values?: undefined): string;
    encodeFunctionData(functionFragment: "requireExchangeBetweenSynthsAllowed", values: [PromiseOrValue<BytesLike>, PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "requireFuturesActive", values?: undefined): string;
    encodeFunctionData(functionFragment: "requireFuturesMarketActive", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "requireIssuanceActive", values?: undefined): string;
    encodeFunctionData(functionFragment: "requireSynthActive", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "requireSynthExchangeActive", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "requireSynthsActive", values: [PromiseOrValue<BytesLike>, PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "requireSystemActive", values?: undefined): string;
    encodeFunctionData(functionFragment: "resumeExchange", values?: undefined): string;
    encodeFunctionData(functionFragment: "resumeFutures", values?: undefined): string;
    encodeFunctionData(functionFragment: "resumeFuturesMarket", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "resumeFuturesMarkets", values: [PromiseOrValue<BytesLike>[]]): string;
    encodeFunctionData(functionFragment: "resumeIssuance", values?: undefined): string;
    encodeFunctionData(functionFragment: "resumeSynth", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "resumeSynthExchange", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "resumeSynths", values: [PromiseOrValue<BytesLike>[]]): string;
    encodeFunctionData(functionFragment: "resumeSynthsExchange", values: [PromiseOrValue<BytesLike>[]]): string;
    encodeFunctionData(functionFragment: "resumeSystem", values?: undefined): string;
    encodeFunctionData(functionFragment: "suspendExchange", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "suspendFutures", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "suspendFuturesMarket", values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "suspendFuturesMarkets", values: [PromiseOrValue<BytesLike>[], PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "suspendIssuance", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "suspendSynth", values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "suspendSynthExchange", values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "suspendSynths", values: [PromiseOrValue<BytesLike>[], PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "suspendSynthsExchange", values: [PromiseOrValue<BytesLike>[], PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "suspendSystem", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "synthExchangeSuspension", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "synthSuspended", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "synthSuspension", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "systemSuspended", values?: undefined): string;
    encodeFunctionData(functionFragment: "systemSuspension", values?: undefined): string;
    encodeFunctionData(functionFragment: "updateAccessControl", values: [
        PromiseOrValue<BytesLike>,
        PromiseOrValue<string>,
        PromiseOrValue<boolean>,
        PromiseOrValue<boolean>
    ]): string;
    encodeFunctionData(functionFragment: "updateAccessControls", values: [
        PromiseOrValue<BytesLike>[],
        PromiseOrValue<string>[],
        PromiseOrValue<boolean>[],
        PromiseOrValue<boolean>[]
    ]): string;
    decodeFunctionResult(functionFragment: "CONTRACT_NAME", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "SECTION_EXCHANGE", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "SECTION_FUTURES", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "SECTION_ISSUANCE", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "SECTION_SYNTH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "SECTION_SYNTH_EXCHANGE", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "SECTION_SYSTEM", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "SUSPENSION_REASON_UPGRADE", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "acceptOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "accessControl", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exchangeSuspension", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "futuresMarketSuspension", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "futuresSuspension", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getFuturesMarketSuspensions", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSynthExchangeSuspensions", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSynthSuspensions", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isSystemUpgrading", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "issuanceSuspension", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "nominateNewOwner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "nominatedOwner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requireExchangeActive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requireExchangeBetweenSynthsAllowed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requireFuturesActive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requireFuturesMarketActive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requireIssuanceActive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requireSynthActive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requireSynthExchangeActive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requireSynthsActive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "requireSystemActive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resumeExchange", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resumeFutures", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resumeFuturesMarket", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resumeFuturesMarkets", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resumeIssuance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resumeSynth", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resumeSynthExchange", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resumeSynths", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resumeSynthsExchange", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resumeSystem", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "suspendExchange", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "suspendFutures", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "suspendFuturesMarket", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "suspendFuturesMarkets", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "suspendIssuance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "suspendSynth", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "suspendSynthExchange", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "suspendSynths", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "suspendSynthsExchange", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "suspendSystem", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "synthExchangeSuspension", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "synthSuspended", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "synthSuspension", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "systemSuspended", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "systemSuspension", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateAccessControl", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateAccessControls", data: BytesLike): Result;
    events: {
        "AccessControlUpdated(bytes32,address,bool,bool)": EventFragment;
        "ExchangeResumed(uint256)": EventFragment;
        "ExchangeSuspended(uint256)": EventFragment;
        "FuturesMarketResumed(bytes32,uint256)": EventFragment;
        "FuturesMarketSuspended(bytes32,uint256)": EventFragment;
        "FuturesResumed(uint256)": EventFragment;
        "FuturesSuspended(uint256)": EventFragment;
        "IssuanceResumed(uint256)": EventFragment;
        "IssuanceSuspended(uint256)": EventFragment;
        "OwnerChanged(address,address)": EventFragment;
        "OwnerNominated(address)": EventFragment;
        "SynthExchangeResumed(bytes32,uint256)": EventFragment;
        "SynthExchangeSuspended(bytes32,uint256)": EventFragment;
        "SynthResumed(bytes32,uint256)": EventFragment;
        "SynthSuspended(bytes32,uint256)": EventFragment;
        "SystemResumed(uint256)": EventFragment;
        "SystemSuspended(uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AccessControlUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExchangeResumed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExchangeSuspended"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "FuturesMarketResumed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "FuturesMarketSuspended"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "FuturesResumed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "FuturesSuspended"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IssuanceResumed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "IssuanceSuspended"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OwnerChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OwnerNominated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SynthExchangeResumed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SynthExchangeSuspended"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SynthResumed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SynthSuspended"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SystemResumed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SystemSuspended"): EventFragment;
}
export interface AccessControlUpdatedEventObject {
    section: string;
    account: string;
    canSuspend: boolean;
    canResume: boolean;
}
export type AccessControlUpdatedEvent = TypedEvent<[
    string,
    string,
    boolean,
    boolean
], AccessControlUpdatedEventObject>;
export type AccessControlUpdatedEventFilter = TypedEventFilter<AccessControlUpdatedEvent>;
export interface ExchangeResumedEventObject {
    reason: BigNumber;
}
export type ExchangeResumedEvent = TypedEvent<[
    BigNumber
], ExchangeResumedEventObject>;
export type ExchangeResumedEventFilter = TypedEventFilter<ExchangeResumedEvent>;
export interface ExchangeSuspendedEventObject {
    reason: BigNumber;
}
export type ExchangeSuspendedEvent = TypedEvent<[
    BigNumber
], ExchangeSuspendedEventObject>;
export type ExchangeSuspendedEventFilter = TypedEventFilter<ExchangeSuspendedEvent>;
export interface FuturesMarketResumedEventObject {
    marketKey: string;
    reason: BigNumber;
}
export type FuturesMarketResumedEvent = TypedEvent<[
    string,
    BigNumber
], FuturesMarketResumedEventObject>;
export type FuturesMarketResumedEventFilter = TypedEventFilter<FuturesMarketResumedEvent>;
export interface FuturesMarketSuspendedEventObject {
    marketKey: string;
    reason: BigNumber;
}
export type FuturesMarketSuspendedEvent = TypedEvent<[
    string,
    BigNumber
], FuturesMarketSuspendedEventObject>;
export type FuturesMarketSuspendedEventFilter = TypedEventFilter<FuturesMarketSuspendedEvent>;
export interface FuturesResumedEventObject {
    reason: BigNumber;
}
export type FuturesResumedEvent = TypedEvent<[
    BigNumber
], FuturesResumedEventObject>;
export type FuturesResumedEventFilter = TypedEventFilter<FuturesResumedEvent>;
export interface FuturesSuspendedEventObject {
    reason: BigNumber;
}
export type FuturesSuspendedEvent = TypedEvent<[
    BigNumber
], FuturesSuspendedEventObject>;
export type FuturesSuspendedEventFilter = TypedEventFilter<FuturesSuspendedEvent>;
export interface IssuanceResumedEventObject {
    reason: BigNumber;
}
export type IssuanceResumedEvent = TypedEvent<[
    BigNumber
], IssuanceResumedEventObject>;
export type IssuanceResumedEventFilter = TypedEventFilter<IssuanceResumedEvent>;
export interface IssuanceSuspendedEventObject {
    reason: BigNumber;
}
export type IssuanceSuspendedEvent = TypedEvent<[
    BigNumber
], IssuanceSuspendedEventObject>;
export type IssuanceSuspendedEventFilter = TypedEventFilter<IssuanceSuspendedEvent>;
export interface OwnerChangedEventObject {
    oldOwner: string;
    newOwner: string;
}
export type OwnerChangedEvent = TypedEvent<[
    string,
    string
], OwnerChangedEventObject>;
export type OwnerChangedEventFilter = TypedEventFilter<OwnerChangedEvent>;
export interface OwnerNominatedEventObject {
    newOwner: string;
}
export type OwnerNominatedEvent = TypedEvent<[
    string
], OwnerNominatedEventObject>;
export type OwnerNominatedEventFilter = TypedEventFilter<OwnerNominatedEvent>;
export interface SynthExchangeResumedEventObject {
    currencyKey: string;
    reason: BigNumber;
}
export type SynthExchangeResumedEvent = TypedEvent<[
    string,
    BigNumber
], SynthExchangeResumedEventObject>;
export type SynthExchangeResumedEventFilter = TypedEventFilter<SynthExchangeResumedEvent>;
export interface SynthExchangeSuspendedEventObject {
    currencyKey: string;
    reason: BigNumber;
}
export type SynthExchangeSuspendedEvent = TypedEvent<[
    string,
    BigNumber
], SynthExchangeSuspendedEventObject>;
export type SynthExchangeSuspendedEventFilter = TypedEventFilter<SynthExchangeSuspendedEvent>;
export interface SynthResumedEventObject {
    currencyKey: string;
    reason: BigNumber;
}
export type SynthResumedEvent = TypedEvent<[
    string,
    BigNumber
], SynthResumedEventObject>;
export type SynthResumedEventFilter = TypedEventFilter<SynthResumedEvent>;
export interface SynthSuspendedEventObject {
    currencyKey: string;
    reason: BigNumber;
}
export type SynthSuspendedEvent = TypedEvent<[
    string,
    BigNumber
], SynthSuspendedEventObject>;
export type SynthSuspendedEventFilter = TypedEventFilter<SynthSuspendedEvent>;
export interface SystemResumedEventObject {
    reason: BigNumber;
}
export type SystemResumedEvent = TypedEvent<[
    BigNumber
], SystemResumedEventObject>;
export type SystemResumedEventFilter = TypedEventFilter<SystemResumedEvent>;
export interface SystemSuspendedEventObject {
    reason: BigNumber;
}
export type SystemSuspendedEvent = TypedEvent<[
    BigNumber
], SystemSuspendedEventObject>;
export type SystemSuspendedEventFilter = TypedEventFilter<SystemSuspendedEvent>;
export interface SystemStatus extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: SystemStatusInterface;
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
        CONTRACT_NAME(overrides?: CallOverrides): Promise<[string]>;
        SECTION_EXCHANGE(overrides?: CallOverrides): Promise<[string]>;
        SECTION_FUTURES(overrides?: CallOverrides): Promise<[string]>;
        SECTION_ISSUANCE(overrides?: CallOverrides): Promise<[string]>;
        SECTION_SYNTH(overrides?: CallOverrides): Promise<[string]>;
        SECTION_SYNTH_EXCHANGE(overrides?: CallOverrides): Promise<[string]>;
        SECTION_SYSTEM(overrides?: CallOverrides): Promise<[string]>;
        SUSPENSION_REASON_UPGRADE(overrides?: CallOverrides): Promise<[BigNumber]>;
        acceptOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        accessControl(arg0: PromiseOrValue<BytesLike>, arg1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[
            boolean,
            boolean
        ] & {
            canSuspend: boolean;
            canResume: boolean;
        }>;
        exchangeSuspension(overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        futuresMarketSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        futuresSuspension(overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        getFuturesMarketSuspensions(marketKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<[
            boolean[],
            BigNumber[]
        ] & {
            suspensions: boolean[];
            reasons: BigNumber[];
        }>;
        getSynthExchangeSuspensions(synths: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<[
            boolean[],
            BigNumber[]
        ] & {
            exchangeSuspensions: boolean[];
            reasons: BigNumber[];
        }>;
        getSynthSuspensions(synths: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<[
            boolean[],
            BigNumber[]
        ] & {
            suspensions: boolean[];
            reasons: BigNumber[];
        }>;
        isSystemUpgrading(overrides?: CallOverrides): Promise<[boolean]>;
        issuanceSuspension(overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        nominatedOwner(overrides?: CallOverrides): Promise<[string]>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        requireExchangeActive(overrides?: CallOverrides): Promise<[void]>;
        requireExchangeBetweenSynthsAllowed(sourceCurrencyKey: PromiseOrValue<BytesLike>, destinationCurrencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[void]>;
        requireFuturesActive(overrides?: CallOverrides): Promise<[void]>;
        requireFuturesMarketActive(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[void]>;
        requireIssuanceActive(overrides?: CallOverrides): Promise<[void]>;
        requireSynthActive(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[void]>;
        requireSynthExchangeActive(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[void]>;
        requireSynthsActive(sourceCurrencyKey: PromiseOrValue<BytesLike>, destinationCurrencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[void]>;
        requireSystemActive(overrides?: CallOverrides): Promise<[void]>;
        resumeExchange(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        resumeFutures(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        resumeFuturesMarket(marketKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        resumeFuturesMarkets(marketKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        resumeIssuance(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        resumeSynth(currencyKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        resumeSynthExchange(currencyKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        resumeSynths(currencyKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        resumeSynthsExchange(currencyKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        resumeSystem(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        suspendExchange(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        suspendFutures(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        suspendFuturesMarket(marketKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        suspendFuturesMarkets(marketKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        suspendIssuance(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        suspendSynth(currencyKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        suspendSynthExchange(currencyKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        suspendSynths(currencyKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        suspendSynthsExchange(currencyKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        suspendSystem(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        synthExchangeSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        synthSuspended(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean]>;
        synthSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        systemSuspended(overrides?: CallOverrides): Promise<[boolean]>;
        systemSuspension(overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        updateAccessControl(section: PromiseOrValue<BytesLike>, account: PromiseOrValue<string>, canSuspend: PromiseOrValue<boolean>, canResume: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        updateAccessControls(sections: PromiseOrValue<BytesLike>[], accounts: PromiseOrValue<string>[], canSuspends: PromiseOrValue<boolean>[], canResumes: PromiseOrValue<boolean>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    CONTRACT_NAME(overrides?: CallOverrides): Promise<string>;
    SECTION_EXCHANGE(overrides?: CallOverrides): Promise<string>;
    SECTION_FUTURES(overrides?: CallOverrides): Promise<string>;
    SECTION_ISSUANCE(overrides?: CallOverrides): Promise<string>;
    SECTION_SYNTH(overrides?: CallOverrides): Promise<string>;
    SECTION_SYNTH_EXCHANGE(overrides?: CallOverrides): Promise<string>;
    SECTION_SYSTEM(overrides?: CallOverrides): Promise<string>;
    SUSPENSION_REASON_UPGRADE(overrides?: CallOverrides): Promise<BigNumber>;
    acceptOwnership(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    accessControl(arg0: PromiseOrValue<BytesLike>, arg1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean, boolean] & {
        canSuspend: boolean;
        canResume: boolean;
    }>;
    exchangeSuspension(overrides?: CallOverrides): Promise<[boolean, BigNumber] & {
        suspended: boolean;
        reason: BigNumber;
    }>;
    futuresMarketSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean, BigNumber] & {
        suspended: boolean;
        reason: BigNumber;
    }>;
    futuresSuspension(overrides?: CallOverrides): Promise<[boolean, BigNumber] & {
        suspended: boolean;
        reason: BigNumber;
    }>;
    getFuturesMarketSuspensions(marketKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<[
        boolean[],
        BigNumber[]
    ] & {
        suspensions: boolean[];
        reasons: BigNumber[];
    }>;
    getSynthExchangeSuspensions(synths: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<[
        boolean[],
        BigNumber[]
    ] & {
        exchangeSuspensions: boolean[];
        reasons: BigNumber[];
    }>;
    getSynthSuspensions(synths: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<[
        boolean[],
        BigNumber[]
    ] & {
        suspensions: boolean[];
        reasons: BigNumber[];
    }>;
    isSystemUpgrading(overrides?: CallOverrides): Promise<boolean>;
    issuanceSuspension(overrides?: CallOverrides): Promise<[boolean, BigNumber] & {
        suspended: boolean;
        reason: BigNumber;
    }>;
    nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    nominatedOwner(overrides?: CallOverrides): Promise<string>;
    owner(overrides?: CallOverrides): Promise<string>;
    requireExchangeActive(overrides?: CallOverrides): Promise<void>;
    requireExchangeBetweenSynthsAllowed(sourceCurrencyKey: PromiseOrValue<BytesLike>, destinationCurrencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
    requireFuturesActive(overrides?: CallOverrides): Promise<void>;
    requireFuturesMarketActive(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
    requireIssuanceActive(overrides?: CallOverrides): Promise<void>;
    requireSynthActive(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
    requireSynthExchangeActive(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
    requireSynthsActive(sourceCurrencyKey: PromiseOrValue<BytesLike>, destinationCurrencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
    requireSystemActive(overrides?: CallOverrides): Promise<void>;
    resumeExchange(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    resumeFutures(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    resumeFuturesMarket(marketKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    resumeFuturesMarkets(marketKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    resumeIssuance(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    resumeSynth(currencyKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    resumeSynthExchange(currencyKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    resumeSynths(currencyKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    resumeSynthsExchange(currencyKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    resumeSystem(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    suspendExchange(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    suspendFutures(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    suspendFuturesMarket(marketKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    suspendFuturesMarkets(marketKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    suspendIssuance(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    suspendSynth(currencyKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    suspendSynthExchange(currencyKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    suspendSynths(currencyKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    suspendSynthsExchange(currencyKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    suspendSystem(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    synthExchangeSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean, BigNumber] & {
        suspended: boolean;
        reason: BigNumber;
    }>;
    synthSuspended(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    synthSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean, BigNumber] & {
        suspended: boolean;
        reason: BigNumber;
    }>;
    systemSuspended(overrides?: CallOverrides): Promise<boolean>;
    systemSuspension(overrides?: CallOverrides): Promise<[boolean, BigNumber] & {
        suspended: boolean;
        reason: BigNumber;
    }>;
    updateAccessControl(section: PromiseOrValue<BytesLike>, account: PromiseOrValue<string>, canSuspend: PromiseOrValue<boolean>, canResume: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    updateAccessControls(sections: PromiseOrValue<BytesLike>[], accounts: PromiseOrValue<string>[], canSuspends: PromiseOrValue<boolean>[], canResumes: PromiseOrValue<boolean>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        CONTRACT_NAME(overrides?: CallOverrides): Promise<string>;
        SECTION_EXCHANGE(overrides?: CallOverrides): Promise<string>;
        SECTION_FUTURES(overrides?: CallOverrides): Promise<string>;
        SECTION_ISSUANCE(overrides?: CallOverrides): Promise<string>;
        SECTION_SYNTH(overrides?: CallOverrides): Promise<string>;
        SECTION_SYNTH_EXCHANGE(overrides?: CallOverrides): Promise<string>;
        SECTION_SYSTEM(overrides?: CallOverrides): Promise<string>;
        SUSPENSION_REASON_UPGRADE(overrides?: CallOverrides): Promise<BigNumber>;
        acceptOwnership(overrides?: CallOverrides): Promise<void>;
        accessControl(arg0: PromiseOrValue<BytesLike>, arg1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[
            boolean,
            boolean
        ] & {
            canSuspend: boolean;
            canResume: boolean;
        }>;
        exchangeSuspension(overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        futuresMarketSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        futuresSuspension(overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        getFuturesMarketSuspensions(marketKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<[
            boolean[],
            BigNumber[]
        ] & {
            suspensions: boolean[];
            reasons: BigNumber[];
        }>;
        getSynthExchangeSuspensions(synths: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<[
            boolean[],
            BigNumber[]
        ] & {
            exchangeSuspensions: boolean[];
            reasons: BigNumber[];
        }>;
        getSynthSuspensions(synths: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<[
            boolean[],
            BigNumber[]
        ] & {
            suspensions: boolean[];
            reasons: BigNumber[];
        }>;
        isSystemUpgrading(overrides?: CallOverrides): Promise<boolean>;
        issuanceSuspension(overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        nominatedOwner(overrides?: CallOverrides): Promise<string>;
        owner(overrides?: CallOverrides): Promise<string>;
        requireExchangeActive(overrides?: CallOverrides): Promise<void>;
        requireExchangeBetweenSynthsAllowed(sourceCurrencyKey: PromiseOrValue<BytesLike>, destinationCurrencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        requireFuturesActive(overrides?: CallOverrides): Promise<void>;
        requireFuturesMarketActive(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        requireIssuanceActive(overrides?: CallOverrides): Promise<void>;
        requireSynthActive(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        requireSynthExchangeActive(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        requireSynthsActive(sourceCurrencyKey: PromiseOrValue<BytesLike>, destinationCurrencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        requireSystemActive(overrides?: CallOverrides): Promise<void>;
        resumeExchange(overrides?: CallOverrides): Promise<void>;
        resumeFutures(overrides?: CallOverrides): Promise<void>;
        resumeFuturesMarket(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        resumeFuturesMarkets(marketKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<void>;
        resumeIssuance(overrides?: CallOverrides): Promise<void>;
        resumeSynth(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        resumeSynthExchange(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        resumeSynths(currencyKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<void>;
        resumeSynthsExchange(currencyKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<void>;
        resumeSystem(overrides?: CallOverrides): Promise<void>;
        suspendExchange(reason: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        suspendFutures(reason: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        suspendFuturesMarket(marketKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        suspendFuturesMarkets(marketKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        suspendIssuance(reason: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        suspendSynth(currencyKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        suspendSynthExchange(currencyKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        suspendSynths(currencyKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        suspendSynthsExchange(currencyKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        suspendSystem(reason: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        synthExchangeSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        synthSuspended(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
        synthSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        systemSuspended(overrides?: CallOverrides): Promise<boolean>;
        systemSuspension(overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            suspended: boolean;
            reason: BigNumber;
        }>;
        updateAccessControl(section: PromiseOrValue<BytesLike>, account: PromiseOrValue<string>, canSuspend: PromiseOrValue<boolean>, canResume: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        updateAccessControls(sections: PromiseOrValue<BytesLike>[], accounts: PromiseOrValue<string>[], canSuspends: PromiseOrValue<boolean>[], canResumes: PromiseOrValue<boolean>[], overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "AccessControlUpdated(bytes32,address,bool,bool)"(section?: PromiseOrValue<BytesLike> | null, account?: PromiseOrValue<string> | null, canSuspend?: null, canResume?: null): AccessControlUpdatedEventFilter;
        AccessControlUpdated(section?: PromiseOrValue<BytesLike> | null, account?: PromiseOrValue<string> | null, canSuspend?: null, canResume?: null): AccessControlUpdatedEventFilter;
        "ExchangeResumed(uint256)"(reason?: null): ExchangeResumedEventFilter;
        ExchangeResumed(reason?: null): ExchangeResumedEventFilter;
        "ExchangeSuspended(uint256)"(reason?: null): ExchangeSuspendedEventFilter;
        ExchangeSuspended(reason?: null): ExchangeSuspendedEventFilter;
        "FuturesMarketResumed(bytes32,uint256)"(marketKey?: null, reason?: null): FuturesMarketResumedEventFilter;
        FuturesMarketResumed(marketKey?: null, reason?: null): FuturesMarketResumedEventFilter;
        "FuturesMarketSuspended(bytes32,uint256)"(marketKey?: null, reason?: null): FuturesMarketSuspendedEventFilter;
        FuturesMarketSuspended(marketKey?: null, reason?: null): FuturesMarketSuspendedEventFilter;
        "FuturesResumed(uint256)"(reason?: null): FuturesResumedEventFilter;
        FuturesResumed(reason?: null): FuturesResumedEventFilter;
        "FuturesSuspended(uint256)"(reason?: null): FuturesSuspendedEventFilter;
        FuturesSuspended(reason?: null): FuturesSuspendedEventFilter;
        "IssuanceResumed(uint256)"(reason?: null): IssuanceResumedEventFilter;
        IssuanceResumed(reason?: null): IssuanceResumedEventFilter;
        "IssuanceSuspended(uint256)"(reason?: null): IssuanceSuspendedEventFilter;
        IssuanceSuspended(reason?: null): IssuanceSuspendedEventFilter;
        "OwnerChanged(address,address)"(oldOwner?: null, newOwner?: null): OwnerChangedEventFilter;
        OwnerChanged(oldOwner?: null, newOwner?: null): OwnerChangedEventFilter;
        "OwnerNominated(address)"(newOwner?: null): OwnerNominatedEventFilter;
        OwnerNominated(newOwner?: null): OwnerNominatedEventFilter;
        "SynthExchangeResumed(bytes32,uint256)"(currencyKey?: null, reason?: null): SynthExchangeResumedEventFilter;
        SynthExchangeResumed(currencyKey?: null, reason?: null): SynthExchangeResumedEventFilter;
        "SynthExchangeSuspended(bytes32,uint256)"(currencyKey?: null, reason?: null): SynthExchangeSuspendedEventFilter;
        SynthExchangeSuspended(currencyKey?: null, reason?: null): SynthExchangeSuspendedEventFilter;
        "SynthResumed(bytes32,uint256)"(currencyKey?: null, reason?: null): SynthResumedEventFilter;
        SynthResumed(currencyKey?: null, reason?: null): SynthResumedEventFilter;
        "SynthSuspended(bytes32,uint256)"(currencyKey?: null, reason?: null): SynthSuspendedEventFilter;
        SynthSuspended(currencyKey?: null, reason?: null): SynthSuspendedEventFilter;
        "SystemResumed(uint256)"(reason?: null): SystemResumedEventFilter;
        SystemResumed(reason?: null): SystemResumedEventFilter;
        "SystemSuspended(uint256)"(reason?: null): SystemSuspendedEventFilter;
        SystemSuspended(reason?: null): SystemSuspendedEventFilter;
    };
    estimateGas: {
        CONTRACT_NAME(overrides?: CallOverrides): Promise<BigNumber>;
        SECTION_EXCHANGE(overrides?: CallOverrides): Promise<BigNumber>;
        SECTION_FUTURES(overrides?: CallOverrides): Promise<BigNumber>;
        SECTION_ISSUANCE(overrides?: CallOverrides): Promise<BigNumber>;
        SECTION_SYNTH(overrides?: CallOverrides): Promise<BigNumber>;
        SECTION_SYNTH_EXCHANGE(overrides?: CallOverrides): Promise<BigNumber>;
        SECTION_SYSTEM(overrides?: CallOverrides): Promise<BigNumber>;
        SUSPENSION_REASON_UPGRADE(overrides?: CallOverrides): Promise<BigNumber>;
        acceptOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        accessControl(arg0: PromiseOrValue<BytesLike>, arg1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        exchangeSuspension(overrides?: CallOverrides): Promise<BigNumber>;
        futuresMarketSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        futuresSuspension(overrides?: CallOverrides): Promise<BigNumber>;
        getFuturesMarketSuspensions(marketKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<BigNumber>;
        getSynthExchangeSuspensions(synths: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<BigNumber>;
        getSynthSuspensions(synths: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<BigNumber>;
        isSystemUpgrading(overrides?: CallOverrides): Promise<BigNumber>;
        issuanceSuspension(overrides?: CallOverrides): Promise<BigNumber>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        nominatedOwner(overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        requireExchangeActive(overrides?: CallOverrides): Promise<BigNumber>;
        requireExchangeBetweenSynthsAllowed(sourceCurrencyKey: PromiseOrValue<BytesLike>, destinationCurrencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        requireFuturesActive(overrides?: CallOverrides): Promise<BigNumber>;
        requireFuturesMarketActive(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        requireIssuanceActive(overrides?: CallOverrides): Promise<BigNumber>;
        requireSynthActive(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        requireSynthExchangeActive(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        requireSynthsActive(sourceCurrencyKey: PromiseOrValue<BytesLike>, destinationCurrencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        requireSystemActive(overrides?: CallOverrides): Promise<BigNumber>;
        resumeExchange(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        resumeFutures(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        resumeFuturesMarket(marketKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        resumeFuturesMarkets(marketKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        resumeIssuance(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        resumeSynth(currencyKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        resumeSynthExchange(currencyKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        resumeSynths(currencyKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        resumeSynthsExchange(currencyKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        resumeSystem(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        suspendExchange(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        suspendFutures(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        suspendFuturesMarket(marketKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        suspendFuturesMarkets(marketKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        suspendIssuance(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        suspendSynth(currencyKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        suspendSynthExchange(currencyKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        suspendSynths(currencyKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        suspendSynthsExchange(currencyKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        suspendSystem(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        synthExchangeSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        synthSuspended(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        synthSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        systemSuspended(overrides?: CallOverrides): Promise<BigNumber>;
        systemSuspension(overrides?: CallOverrides): Promise<BigNumber>;
        updateAccessControl(section: PromiseOrValue<BytesLike>, account: PromiseOrValue<string>, canSuspend: PromiseOrValue<boolean>, canResume: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        updateAccessControls(sections: PromiseOrValue<BytesLike>[], accounts: PromiseOrValue<string>[], canSuspends: PromiseOrValue<boolean>[], canResumes: PromiseOrValue<boolean>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        CONTRACT_NAME(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        SECTION_EXCHANGE(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        SECTION_FUTURES(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        SECTION_ISSUANCE(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        SECTION_SYNTH(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        SECTION_SYNTH_EXCHANGE(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        SECTION_SYSTEM(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        SUSPENSION_REASON_UPGRADE(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        acceptOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        accessControl(arg0: PromiseOrValue<BytesLike>, arg1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        exchangeSuspension(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        futuresMarketSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        futuresSuspension(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getFuturesMarketSuspensions(marketKeys: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getSynthExchangeSuspensions(synths: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getSynthSuspensions(synths: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isSystemUpgrading(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        issuanceSuspension(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        nominatedOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        requireExchangeActive(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        requireExchangeBetweenSynthsAllowed(sourceCurrencyKey: PromiseOrValue<BytesLike>, destinationCurrencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        requireFuturesActive(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        requireFuturesMarketActive(marketKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        requireIssuanceActive(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        requireSynthActive(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        requireSynthExchangeActive(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        requireSynthsActive(sourceCurrencyKey: PromiseOrValue<BytesLike>, destinationCurrencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        requireSystemActive(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        resumeExchange(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        resumeFutures(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        resumeFuturesMarket(marketKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        resumeFuturesMarkets(marketKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        resumeIssuance(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        resumeSynth(currencyKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        resumeSynthExchange(currencyKey: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        resumeSynths(currencyKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        resumeSynthsExchange(currencyKeys: PromiseOrValue<BytesLike>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        resumeSystem(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        suspendExchange(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        suspendFutures(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        suspendFuturesMarket(marketKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        suspendFuturesMarkets(marketKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        suspendIssuance(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        suspendSynth(currencyKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        suspendSynthExchange(currencyKey: PromiseOrValue<BytesLike>, reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        suspendSynths(currencyKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        suspendSynthsExchange(currencyKeys: PromiseOrValue<BytesLike>[], reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        suspendSystem(reason: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        synthExchangeSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        synthSuspended(currencyKey: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        synthSuspension(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        systemSuspended(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        systemSuspension(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        updateAccessControl(section: PromiseOrValue<BytesLike>, account: PromiseOrValue<string>, canSuspend: PromiseOrValue<boolean>, canResume: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        updateAccessControls(sections: PromiseOrValue<BytesLike>[], accounts: PromiseOrValue<string>[], canSuspends: PromiseOrValue<boolean>[], canResumes: PromiseOrValue<boolean>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}