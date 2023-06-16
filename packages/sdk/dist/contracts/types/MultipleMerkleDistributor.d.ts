import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export declare namespace IMultipleMerkleDistributor {
    type ClaimsStruct = {
        index: PromiseOrValue<BigNumberish>;
        account: PromiseOrValue<string>;
        amount: PromiseOrValue<BigNumberish>;
        merkleProof: PromiseOrValue<BytesLike>[];
        epoch: PromiseOrValue<BigNumberish>;
    };
    type ClaimsStructOutput = [
        BigNumber,
        string,
        BigNumber,
        string[],
        BigNumber
    ] & {
        index: BigNumber;
        account: string;
        amount: BigNumber;
        merkleProof: string[];
        epoch: BigNumber;
    };
}
export interface MultipleMerkleDistributorInterface extends utils.Interface {
    functions: {
        "acceptOwnership()": FunctionFragment;
        "claim(uint256,address,uint256,bytes32[],uint256)": FunctionFragment;
        "claimMultiple((uint256,address,uint256,bytes32[],uint256)[])": FunctionFragment;
        "distributionEpoch()": FunctionFragment;
        "isClaimed(uint256,uint256)": FunctionFragment;
        "merkleRoots(uint256)": FunctionFragment;
        "newMerkleRoot(bytes32)": FunctionFragment;
        "nominateNewOwner(address)": FunctionFragment;
        "nominatedOwner()": FunctionFragment;
        "owner()": FunctionFragment;
        "rewardEscrow()": FunctionFragment;
        "token()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "acceptOwnership" | "claim" | "claimMultiple" | "distributionEpoch" | "isClaimed" | "merkleRoots" | "newMerkleRoot" | "nominateNewOwner" | "nominatedOwner" | "owner" | "rewardEscrow" | "token"): FunctionFragment;
    encodeFunctionData(functionFragment: "acceptOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "claim", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>[],
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "claimMultiple", values: [IMultipleMerkleDistributor.ClaimsStruct[]]): string;
    encodeFunctionData(functionFragment: "distributionEpoch", values?: undefined): string;
    encodeFunctionData(functionFragment: "isClaimed", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "merkleRoots", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "newMerkleRoot", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "nominateNewOwner", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "nominatedOwner", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewardEscrow", values?: undefined): string;
    encodeFunctionData(functionFragment: "token", values?: undefined): string;
    decodeFunctionResult(functionFragment: "acceptOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claim", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimMultiple", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "distributionEpoch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isClaimed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "merkleRoots", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "newMerkleRoot", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "nominateNewOwner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "nominatedOwner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardEscrow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "token", data: BytesLike): Result;
    events: {
        "Claimed(uint256,address,uint256,uint256)": EventFragment;
        "MerkleRootAdded(uint256)": EventFragment;
        "OwnerChanged(address,address)": EventFragment;
        "OwnerNominated(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Claimed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MerkleRootAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OwnerChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "OwnerNominated"): EventFragment;
}
export interface ClaimedEventObject {
    index: BigNumber;
    account: string;
    amount: BigNumber;
    epoch: BigNumber;
}
export type ClaimedEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber,
    BigNumber
], ClaimedEventObject>;
export type ClaimedEventFilter = TypedEventFilter<ClaimedEvent>;
export interface MerkleRootAddedEventObject {
    epoch: BigNumber;
}
export type MerkleRootAddedEvent = TypedEvent<[
    BigNumber
], MerkleRootAddedEventObject>;
export type MerkleRootAddedEventFilter = TypedEventFilter<MerkleRootAddedEvent>;
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
export interface MultipleMerkleDistributor extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: MultipleMerkleDistributorInterface;
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
        acceptOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        claim(index: PromiseOrValue<BigNumberish>, account: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, merkleProof: PromiseOrValue<BytesLike>[], epoch: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        claimMultiple(claims: IMultipleMerkleDistributor.ClaimsStruct[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        distributionEpoch(overrides?: CallOverrides): Promise<[BigNumber]>;
        isClaimed(index: PromiseOrValue<BigNumberish>, epoch: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[boolean]>;
        merkleRoots(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        newMerkleRoot(_merkleRoot: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        nominatedOwner(overrides?: CallOverrides): Promise<[string]>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        rewardEscrow(overrides?: CallOverrides): Promise<[string]>;
        token(overrides?: CallOverrides): Promise<[string]>;
    };
    acceptOwnership(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    claim(index: PromiseOrValue<BigNumberish>, account: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, merkleProof: PromiseOrValue<BytesLike>[], epoch: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    claimMultiple(claims: IMultipleMerkleDistributor.ClaimsStruct[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    distributionEpoch(overrides?: CallOverrides): Promise<BigNumber>;
    isClaimed(index: PromiseOrValue<BigNumberish>, epoch: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
    merkleRoots(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    newMerkleRoot(_merkleRoot: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    nominatedOwner(overrides?: CallOverrides): Promise<string>;
    owner(overrides?: CallOverrides): Promise<string>;
    rewardEscrow(overrides?: CallOverrides): Promise<string>;
    token(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        acceptOwnership(overrides?: CallOverrides): Promise<void>;
        claim(index: PromiseOrValue<BigNumberish>, account: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, merkleProof: PromiseOrValue<BytesLike>[], epoch: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        claimMultiple(claims: IMultipleMerkleDistributor.ClaimsStruct[], overrides?: CallOverrides): Promise<void>;
        distributionEpoch(overrides?: CallOverrides): Promise<BigNumber>;
        isClaimed(index: PromiseOrValue<BigNumberish>, epoch: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        merkleRoots(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        newMerkleRoot(_merkleRoot: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        nominatedOwner(overrides?: CallOverrides): Promise<string>;
        owner(overrides?: CallOverrides): Promise<string>;
        rewardEscrow(overrides?: CallOverrides): Promise<string>;
        token(overrides?: CallOverrides): Promise<string>;
    };
    filters: {
        "Claimed(uint256,address,uint256,uint256)"(index?: null, account?: null, amount?: null, epoch?: null): ClaimedEventFilter;
        Claimed(index?: null, account?: null, amount?: null, epoch?: null): ClaimedEventFilter;
        "MerkleRootAdded(uint256)"(epoch?: null): MerkleRootAddedEventFilter;
        MerkleRootAdded(epoch?: null): MerkleRootAddedEventFilter;
        "OwnerChanged(address,address)"(oldOwner?: null, newOwner?: null): OwnerChangedEventFilter;
        OwnerChanged(oldOwner?: null, newOwner?: null): OwnerChangedEventFilter;
        "OwnerNominated(address)"(newOwner?: null): OwnerNominatedEventFilter;
        OwnerNominated(newOwner?: null): OwnerNominatedEventFilter;
    };
    estimateGas: {
        acceptOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        claim(index: PromiseOrValue<BigNumberish>, account: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, merkleProof: PromiseOrValue<BytesLike>[], epoch: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        claimMultiple(claims: IMultipleMerkleDistributor.ClaimsStruct[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        distributionEpoch(overrides?: CallOverrides): Promise<BigNumber>;
        isClaimed(index: PromiseOrValue<BigNumberish>, epoch: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        merkleRoots(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        newMerkleRoot(_merkleRoot: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        nominatedOwner(overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        rewardEscrow(overrides?: CallOverrides): Promise<BigNumber>;
        token(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        acceptOwnership(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        claim(index: PromiseOrValue<BigNumberish>, account: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, merkleProof: PromiseOrValue<BytesLike>[], epoch: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        claimMultiple(claims: IMultipleMerkleDistributor.ClaimsStruct[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        distributionEpoch(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isClaimed(index: PromiseOrValue<BigNumberish>, epoch: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        merkleRoots(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        newMerkleRoot(_merkleRoot: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        nominateNewOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        nominatedOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rewardEscrow(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        token(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}