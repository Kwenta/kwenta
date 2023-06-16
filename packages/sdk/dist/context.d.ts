/// <reference types="node" />
import { EventEmitter } from 'events';
import { Provider as EthCallProvider } from 'ethcall';
import { ethers } from 'ethers';
import { ContractsMap, MulticallContractsMap } from './contracts';
import { NetworkId } from './types/common';
export interface IContext {
    provider: ethers.providers.Provider;
    networkId: NetworkId;
    signer?: ethers.Signer;
    walletAddress?: string;
    logError?: (err: Error, skipReport?: boolean) => void;
}
export default class Context implements IContext {
    private context;
    multicallProvider: EthCallProvider;
    contracts: ContractsMap;
    multicallContracts: MulticallContractsMap;
    events: EventEmitter;
    constructor(context: IContext);
    get networkId(): NetworkId;
    get provider(): ethers.providers.Provider;
    get signer(): ethers.Signer;
    get walletAddress(): string;
    get isL2(): boolean;
    get isMainnet(): boolean;
    setProvider(provider: ethers.providers.Provider): Promise<NetworkId>;
    setNetworkId(networkId: NetworkId): void;
    setSigner(signer: ethers.Signer): Promise<void>;
    logError(err: Error, skipReport?: boolean): void | undefined;
}
