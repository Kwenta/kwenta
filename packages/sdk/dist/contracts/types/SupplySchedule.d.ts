import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export interface SupplyScheduleInterface extends utils.Interface {
    functions: {
        "DECAY_RATE()": FunctionFragment;
        "INITIAL_SUPPLY()": FunctionFragment;
        "INITIAL_WEEKLY_SUPPLY()": FunctionFragment;
        "MAX_MINTER_REWARD()": FunctionFragment;
        "MINT_BUFFER()": FunctionFragment;
        "MINT_PERIOD_DURATION()": FunctionFragment;
        "SUPPLY_DECAY_END()": FunctionFragment;
        "SUPPLY_DECAY_START()": FunctionFragment;
        "TERMINAL_SUPPLY_RATE_ANNUAL()": FunctionFragment;
        "acceptOwnership()": FunctionFragment;
        "inflationStartDate()": FunctionFragment;
        "isMintable()": FunctionFragment;
        "kwenta()": FunctionFragment;
        "lastMintEvent()": FunctionFragment;
        "mint()": FunctionFragment;
        "mintableSupply()": FunctionFragment;
        "minterReward()": FunctionFragment;
        "nominateNewOwner(address)": FunctionFragment;
        "nominatedOwner()": FunctionFragment;
        "owner()": FunctionFragment;
        "setKwenta(address)": FunctionFragment;
        "setMinterReward(uint256)": FunctionFragment;
        "setStakingRewards(address)": FunctionFragment;
        "setTradingRewards(address)": FunctionFragment;
        "setTradingRewardsDiversion(uint256)": FunctionFragment;
        "setTreasuryDAO(address)": FunctionFragment;
        "setTreasuryDiversion(uint256)": FunctionFragment;
        "stakingRewards()": FunctionFragment;
        "terminalInflationSupply(uint256,uint256)": FunctionFragment;
        "tokenDecaySupplyForWeek(uint256)": FunctionFragment;
        "tradingRewards()": FunctionFragment;
        "tradingRewardsDiversion()": FunctionFragment;
        "treasuryDAO()": FunctionFragment;
        "treasuryDiversion()": FunctionFragment;
        "weekCounter()": FunctionFragment;
        "weeksSinceLastIssuance()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "DECAY_RATE" | "INITIAL_SUPPLY" | "INITIAL_WEEKLY_SUPPLY" | "MAX_MINTER_REWARD" | "MINT_BUFFER" | "MINT_PERIOD_DURATION" | "SUPPLY_DECAY_END" | "SUPPLY_DECAY_START" | "TERMINAL_SUPPLY_RATE_ANNUAL" | "acceptOwnership" | "inflationStartDate" | "isMintable" | "kwenta" | "lastMintEvent" | "mint" | "mintableSupply" | "minterReward" | "nominateNewOwner" | "nominatedOwner" | "owner" | "setKwenta" | "setMinterReward" | "setStakingRewards" | "setTradingRewards" | "setTradingRewardsDiversion" | "setTreasuryDAO" | "setTreasuryDiversion" | "stakingRewards" | "terminalInflationSupply" | "tokenDecaySupplyForWeek" | "tradingRewards" | "tradingRewardsDiversion" | "treasuryDAO" | "treasuryDiversion" | "weekCounter" | "weeksSinceLastIssuance"): FunctionFragment;
    encodeFunctionData(functionFragment: "DECAY_RATE", values?: undefined): string;
    encodeFunctionData(functionFragment: "INITIAL_SUPPLY", values?: undefined): string;
    encodeFunctionData(functionFragment: "INITIAL_WEEKLY_SUPPLY", values?: undefined): string;
    encodeFunctionData(functionFragment: "MAX_MINTER_REWARD", values?: undefined): string;
    encodeFunctionData(functionFragment: "MINT_BUFFER", values?: undefined): string;
    encodeFunctionData(functionFragment: "MINT_PERIOD_DURATION", values?: undefined): string;
    encodeFunctionData(functionFragment: "SUPPLY_DECAY_END", values?: undefined): string;
    encodeFunctionData(functionFragment: "SUPPLY_DECAY_START", values?: undefined): string;
    encodeFunctionData(functionFragment: "TERMINAL_SUPPLY_RATE_ANNUAL", values?: undefined): string;
    encodeFunctionData(functionFragment: "acceptOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "inflationStartDate", values?: undefined): string;
    encodeFunctionData(functionFragment: "isMintable", values?: undefined): string;
    encodeFunctionData(functionFragment: "kwenta", values?: undefined): string;
    encodeFunctionData(functionFragment: "lastMintEvent", values?: undefined): string;
    encodeFunctionData(functionFragment: "mint", values?: undefined): string;
    encodeFunctionData(functionFragment: "mintableSupply", values?: undefined): string;
    encodeFunctionData(functionFragment: "minterReward", values?: undefined): string;
    encodeFunctionData(functionFragment: "nominateNewOwner", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "nominatedOwner", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "setKwenta", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setMinterReward", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "setStakingRewards", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setTradingRewards", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setTradingRewardsDiversion", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "setTreasuryDAO", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setTreasuryDiversion", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "stakingRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "terminalInflationSupply", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "tokenDecaySupplyForWeek", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "tradingRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "tradingRewardsDiversion", values?: undefined): string;
    encodeFunctionData(functionFragment: "treasuryDAO", values?: undefined): string;
    encodeFunctionData(functionFragment: "treasuryDiversion", values?: undefined): string;
    encodeFunctionData(functionFragment: "weekCounter", values?: undefined): string;
    encodeFunctionData(functionFragment: "weeksSinceLastIssuance", values?: undefined): string;
    decodeFunctionResult(functionFragment: "DECAY_RATE", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "INITIAL_SUPPLY", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "INITIAL_WEEKLY_SUPPLY", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "MAX_MINTER_REWARD", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "MINT_BUFFER", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "MINT_PERIOD_DURATION", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "SUPPLY_DECAY_END", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "SUPPLY_DECAY_START", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "TERMINAL_SUPPLY_RATE_ANNUAL", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "acceptOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "inflationStartDate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isMintable", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "kwenta", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lastMintEvent", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mintableSupply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "minterReward", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "nominateNewOwner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "nominatedOwner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setKwenta", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setMinterReward", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setStakingRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setTradingRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setTradingRewardsDiversion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setTreasuryDAO", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setTreasuryDiversion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stakingRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "terminalInflationSupply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenDecaySupplyForWeek", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tradingRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tradingRewardsDiversion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "treasuryDAO", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "treasuryDiversion", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "weekCounter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "weeksSinceLastIssuance", data: BytesLike): Result;
    events: {
        "KwentaUpdated(address)": EventFragment;
        "MinterRewardUpdated(uint256)": EventFragment;
        "OwnerChanged(address,address)": EventFragment;
        "OwnerNominated(address)": EventFragment;
        "StakingRewardsUpdated(address)": EventFragment;
        "SupplyMinted(uint256,uint256,uint256)": EventFragment;
        "TradingRewardsDiversionUpdated(uint256)": EventFragment;
        "TradingRewardsUpdated(address)": EventFragment;
        "TreasuryDAOSet(address)": EventFragment;
        "TreasuryDiversionUpdated(uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "KwentaUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MinterRewardUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OwnerChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OwnerNominated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "StakingRewardsUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SupplyMinted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TradingRewardsDiversionUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TradingRewardsUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TreasuryDAOSet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TreasuryDiversionUpdated"): EventFragment;
}
export interface KwentaUpdatedEventObject {
    newAddress: string;
}
export type KwentaUpdatedEvent = TypedEvent<[string], KwentaUpdatedEventObject>;
export type KwentaUpdatedEventFilter = TypedEventFilter<KwentaUpdatedEvent>;
export interface MinterRewardUpdatedEventObject {
    newRewardAmount: BigNumber;
}
export type MinterRewardUpdatedEvent = TypedEvent<[
    BigNumber
], MinterRewardUpdatedEventObject>;
export type MinterRewardUpdatedEventFilter = TypedEventFilter<MinterRewardUpdatedEvent>;
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
export interface StakingRewardsUpdatedEventObject {
    newAddress: string;
}
export type StakingRewardsUpdatedEvent = TypedEvent<[
    string
], StakingRewardsUpdatedEventObject>;
export type StakingRewardsUpdatedEventFilter = TypedEventFilter<StakingRewardsUpdatedEvent>;
export interface SupplyMintedEventObject {
    supplyMinted: BigNumber;
    numberOfWeeksIssued: BigNumber;
    lastMintEvent: BigNumber;
}
export type SupplyMintedEvent = TypedEvent<[
    BigNumber,
    BigNumber,
    BigNumber
], SupplyMintedEventObject>;
export type SupplyMintedEventFilter = TypedEventFilter<SupplyMintedEvent>;
export interface TradingRewardsDiversionUpdatedEventObject {
    newPercentage: BigNumber;
}
export type TradingRewardsDiversionUpdatedEvent = TypedEvent<[
    BigNumber
], TradingRewardsDiversionUpdatedEventObject>;
export type TradingRewardsDiversionUpdatedEventFilter = TypedEventFilter<TradingRewardsDiversionUpdatedEvent>;
export interface TradingRewardsUpdatedEventObject {
    newAddress: string;
}
export type TradingRewardsUpdatedEvent = TypedEvent<[
    string
], TradingRewardsUpdatedEventObject>;
export type TradingRewardsUpdatedEventFilter = TypedEventFilter<TradingRewardsUpdatedEvent>;
export interface TreasuryDAOSetEventObject {
    treasuryDAO: string;
}
export type TreasuryDAOSetEvent = TypedEvent<[
    string
], TreasuryDAOSetEventObject>;
export type TreasuryDAOSetEventFilter = TypedEventFilter<TreasuryDAOSetEvent>;
export interface TreasuryDiversionUpdatedEventObject {
    newPercentage: BigNumber;
}
export type TreasuryDiversionUpdatedEvent = TypedEvent<[
    BigNumber
], TreasuryDiversionUpdatedEventObject>;
export type TreasuryDiversionUpdatedEventFilter = TypedEventFilter<TreasuryDiversionUpdatedEvent>;
export interface SupplySchedule extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: SupplyScheduleInterface;
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
        DECAY_RATE(overrides?: CallOverrides): Promise<[BigNumber]>;
        INITIAL_SUPPLY(overrides?: CallOverrides): Promise<[BigNumber]>;
        INITIAL_WEEKLY_SUPPLY(overrides?: CallOverrides): Promise<[BigNumber]>;
        MAX_MINTER_REWARD(overrides?: CallOverrides): Promise<[BigNumber]>;
        MINT_BUFFER(overrides?: CallOverrides): Promise<[BigNumber]>;
        MINT_PERIOD_DURATION(overrides?: CallOverrides): Promise<[BigNumber]>;
        SUPPLY_DECAY_END(overrides?: CallOverrides): Promise<[number]>;
        SUPPLY_DECAY_START(overrides?: CallOverrides): Promise<[number]>;
        TERMINAL_SUPPLY_RATE_ANNUAL(overrides?: CallOverrides): Promise<[BigNumber]>;
        acceptOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        inflationStartDate(overrides?: CallOverrides): Promise<[BigNumber]>;
        isMintable(overrides?: CallOverrides): Promise<[boolean]>;
        kwenta(overrides?: CallOverrides): Promise<[string]>;
        lastMintEvent(overrides?: CallOverrides): Promise<[BigNumber]>;
        mint(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        mintableSupply(overrides?: CallOverrides): Promise<[BigNumber]>;
        minterReward(overrides?: CallOverrides): Promise<[BigNumber]>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        nominatedOwner(overrides?: CallOverrides): Promise<[string]>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        setKwenta(_kwenta: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setMinterReward(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setStakingRewards(_stakingRewards: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setTradingRewards(_tradingRewards: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setTradingRewardsDiversion(_tradingRewardsDiversion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setTreasuryDAO(_treasuryDAO: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setTreasuryDiversion(_treasuryDiversion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        stakingRewards(overrides?: CallOverrides): Promise<[string]>;
        terminalInflationSupply(totalSupply: PromiseOrValue<BigNumberish>, numOfWeeks: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        tokenDecaySupplyForWeek(counter: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        tradingRewards(overrides?: CallOverrides): Promise<[string]>;
        tradingRewardsDiversion(overrides?: CallOverrides): Promise<[BigNumber]>;
        treasuryDAO(overrides?: CallOverrides): Promise<[string]>;
        treasuryDiversion(overrides?: CallOverrides): Promise<[BigNumber]>;
        weekCounter(overrides?: CallOverrides): Promise<[BigNumber]>;
        weeksSinceLastIssuance(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    DECAY_RATE(overrides?: CallOverrides): Promise<BigNumber>;
    INITIAL_SUPPLY(overrides?: CallOverrides): Promise<BigNumber>;
    INITIAL_WEEKLY_SUPPLY(overrides?: CallOverrides): Promise<BigNumber>;
    MAX_MINTER_REWARD(overrides?: CallOverrides): Promise<BigNumber>;
    MINT_BUFFER(overrides?: CallOverrides): Promise<BigNumber>;
    MINT_PERIOD_DURATION(overrides?: CallOverrides): Promise<BigNumber>;
    SUPPLY_DECAY_END(overrides?: CallOverrides): Promise<number>;
    SUPPLY_DECAY_START(overrides?: CallOverrides): Promise<number>;
    TERMINAL_SUPPLY_RATE_ANNUAL(overrides?: CallOverrides): Promise<BigNumber>;
    acceptOwnership(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    inflationStartDate(overrides?: CallOverrides): Promise<BigNumber>;
    isMintable(overrides?: CallOverrides): Promise<boolean>;
    kwenta(overrides?: CallOverrides): Promise<string>;
    lastMintEvent(overrides?: CallOverrides): Promise<BigNumber>;
    mint(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    mintableSupply(overrides?: CallOverrides): Promise<BigNumber>;
    minterReward(overrides?: CallOverrides): Promise<BigNumber>;
    nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    nominatedOwner(overrides?: CallOverrides): Promise<string>;
    owner(overrides?: CallOverrides): Promise<string>;
    setKwenta(_kwenta: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setMinterReward(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setStakingRewards(_stakingRewards: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setTradingRewards(_tradingRewards: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setTradingRewardsDiversion(_tradingRewardsDiversion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setTreasuryDAO(_treasuryDAO: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setTreasuryDiversion(_treasuryDiversion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    stakingRewards(overrides?: CallOverrides): Promise<string>;
    terminalInflationSupply(totalSupply: PromiseOrValue<BigNumberish>, numOfWeeks: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    tokenDecaySupplyForWeek(counter: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    tradingRewards(overrides?: CallOverrides): Promise<string>;
    tradingRewardsDiversion(overrides?: CallOverrides): Promise<BigNumber>;
    treasuryDAO(overrides?: CallOverrides): Promise<string>;
    treasuryDiversion(overrides?: CallOverrides): Promise<BigNumber>;
    weekCounter(overrides?: CallOverrides): Promise<BigNumber>;
    weeksSinceLastIssuance(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        DECAY_RATE(overrides?: CallOverrides): Promise<BigNumber>;
        INITIAL_SUPPLY(overrides?: CallOverrides): Promise<BigNumber>;
        INITIAL_WEEKLY_SUPPLY(overrides?: CallOverrides): Promise<BigNumber>;
        MAX_MINTER_REWARD(overrides?: CallOverrides): Promise<BigNumber>;
        MINT_BUFFER(overrides?: CallOverrides): Promise<BigNumber>;
        MINT_PERIOD_DURATION(overrides?: CallOverrides): Promise<BigNumber>;
        SUPPLY_DECAY_END(overrides?: CallOverrides): Promise<number>;
        SUPPLY_DECAY_START(overrides?: CallOverrides): Promise<number>;
        TERMINAL_SUPPLY_RATE_ANNUAL(overrides?: CallOverrides): Promise<BigNumber>;
        acceptOwnership(overrides?: CallOverrides): Promise<void>;
        inflationStartDate(overrides?: CallOverrides): Promise<BigNumber>;
        isMintable(overrides?: CallOverrides): Promise<boolean>;
        kwenta(overrides?: CallOverrides): Promise<string>;
        lastMintEvent(overrides?: CallOverrides): Promise<BigNumber>;
        mint(overrides?: CallOverrides): Promise<void>;
        mintableSupply(overrides?: CallOverrides): Promise<BigNumber>;
        minterReward(overrides?: CallOverrides): Promise<BigNumber>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        nominatedOwner(overrides?: CallOverrides): Promise<string>;
        owner(overrides?: CallOverrides): Promise<string>;
        setKwenta(_kwenta: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setMinterReward(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        setStakingRewards(_stakingRewards: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setTradingRewards(_tradingRewards: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setTradingRewardsDiversion(_tradingRewardsDiversion: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        setTreasuryDAO(_treasuryDAO: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setTreasuryDiversion(_treasuryDiversion: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        stakingRewards(overrides?: CallOverrides): Promise<string>;
        terminalInflationSupply(totalSupply: PromiseOrValue<BigNumberish>, numOfWeeks: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        tokenDecaySupplyForWeek(counter: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        tradingRewards(overrides?: CallOverrides): Promise<string>;
        tradingRewardsDiversion(overrides?: CallOverrides): Promise<BigNumber>;
        treasuryDAO(overrides?: CallOverrides): Promise<string>;
        treasuryDiversion(overrides?: CallOverrides): Promise<BigNumber>;
        weekCounter(overrides?: CallOverrides): Promise<BigNumber>;
        weeksSinceLastIssuance(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {
        "KwentaUpdated(address)"(newAddress?: null): KwentaUpdatedEventFilter;
        KwentaUpdated(newAddress?: null): KwentaUpdatedEventFilter;
        "MinterRewardUpdated(uint256)"(newRewardAmount?: null): MinterRewardUpdatedEventFilter;
        MinterRewardUpdated(newRewardAmount?: null): MinterRewardUpdatedEventFilter;
        "OwnerChanged(address,address)"(oldOwner?: null, newOwner?: null): OwnerChangedEventFilter;
        OwnerChanged(oldOwner?: null, newOwner?: null): OwnerChangedEventFilter;
        "OwnerNominated(address)"(newOwner?: null): OwnerNominatedEventFilter;
        OwnerNominated(newOwner?: null): OwnerNominatedEventFilter;
        "StakingRewardsUpdated(address)"(newAddress?: null): StakingRewardsUpdatedEventFilter;
        StakingRewardsUpdated(newAddress?: null): StakingRewardsUpdatedEventFilter;
        "SupplyMinted(uint256,uint256,uint256)"(supplyMinted?: null, numberOfWeeksIssued?: null, lastMintEvent?: null): SupplyMintedEventFilter;
        SupplyMinted(supplyMinted?: null, numberOfWeeksIssued?: null, lastMintEvent?: null): SupplyMintedEventFilter;
        "TradingRewardsDiversionUpdated(uint256)"(newPercentage?: null): TradingRewardsDiversionUpdatedEventFilter;
        TradingRewardsDiversionUpdated(newPercentage?: null): TradingRewardsDiversionUpdatedEventFilter;
        "TradingRewardsUpdated(address)"(newAddress?: null): TradingRewardsUpdatedEventFilter;
        TradingRewardsUpdated(newAddress?: null): TradingRewardsUpdatedEventFilter;
        "TreasuryDAOSet(address)"(treasuryDAO?: null): TreasuryDAOSetEventFilter;
        TreasuryDAOSet(treasuryDAO?: null): TreasuryDAOSetEventFilter;
        "TreasuryDiversionUpdated(uint256)"(newPercentage?: null): TreasuryDiversionUpdatedEventFilter;
        TreasuryDiversionUpdated(newPercentage?: null): TreasuryDiversionUpdatedEventFilter;
    };
    estimateGas: {
        DECAY_RATE(overrides?: CallOverrides): Promise<BigNumber>;
        INITIAL_SUPPLY(overrides?: CallOverrides): Promise<BigNumber>;
        INITIAL_WEEKLY_SUPPLY(overrides?: CallOverrides): Promise<BigNumber>;
        MAX_MINTER_REWARD(overrides?: CallOverrides): Promise<BigNumber>;
        MINT_BUFFER(overrides?: CallOverrides): Promise<BigNumber>;
        MINT_PERIOD_DURATION(overrides?: CallOverrides): Promise<BigNumber>;
        SUPPLY_DECAY_END(overrides?: CallOverrides): Promise<BigNumber>;
        SUPPLY_DECAY_START(overrides?: CallOverrides): Promise<BigNumber>;
        TERMINAL_SUPPLY_RATE_ANNUAL(overrides?: CallOverrides): Promise<BigNumber>;
        acceptOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        inflationStartDate(overrides?: CallOverrides): Promise<BigNumber>;
        isMintable(overrides?: CallOverrides): Promise<BigNumber>;
        kwenta(overrides?: CallOverrides): Promise<BigNumber>;
        lastMintEvent(overrides?: CallOverrides): Promise<BigNumber>;
        mint(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        mintableSupply(overrides?: CallOverrides): Promise<BigNumber>;
        minterReward(overrides?: CallOverrides): Promise<BigNumber>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        nominatedOwner(overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        setKwenta(_kwenta: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setMinterReward(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setStakingRewards(_stakingRewards: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setTradingRewards(_tradingRewards: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setTradingRewardsDiversion(_tradingRewardsDiversion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setTreasuryDAO(_treasuryDAO: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setTreasuryDiversion(_treasuryDiversion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        stakingRewards(overrides?: CallOverrides): Promise<BigNumber>;
        terminalInflationSupply(totalSupply: PromiseOrValue<BigNumberish>, numOfWeeks: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        tokenDecaySupplyForWeek(counter: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        tradingRewards(overrides?: CallOverrides): Promise<BigNumber>;
        tradingRewardsDiversion(overrides?: CallOverrides): Promise<BigNumber>;
        treasuryDAO(overrides?: CallOverrides): Promise<BigNumber>;
        treasuryDiversion(overrides?: CallOverrides): Promise<BigNumber>;
        weekCounter(overrides?: CallOverrides): Promise<BigNumber>;
        weeksSinceLastIssuance(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        DECAY_RATE(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        INITIAL_SUPPLY(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        INITIAL_WEEKLY_SUPPLY(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        MAX_MINTER_REWARD(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        MINT_BUFFER(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        MINT_PERIOD_DURATION(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        SUPPLY_DECAY_END(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        SUPPLY_DECAY_START(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        TERMINAL_SUPPLY_RATE_ANNUAL(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        acceptOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        inflationStartDate(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isMintable(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        kwenta(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lastMintEvent(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        mint(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        mintableSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        minterReward(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        nominatedOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setKwenta(_kwenta: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setMinterReward(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setStakingRewards(_stakingRewards: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setTradingRewards(_tradingRewards: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setTradingRewardsDiversion(_tradingRewardsDiversion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setTreasuryDAO(_treasuryDAO: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setTreasuryDiversion(_treasuryDiversion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        stakingRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        terminalInflationSupply(totalSupply: PromiseOrValue<BigNumberish>, numOfWeeks: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tokenDecaySupplyForWeek(counter: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tradingRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tradingRewardsDiversion(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        treasuryDAO(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        treasuryDiversion(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        weekCounter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        weeksSinceLastIssuance(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}