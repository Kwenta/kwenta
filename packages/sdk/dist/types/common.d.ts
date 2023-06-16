import { ethers } from 'ethers';
export type PriceServer = 'KWENTA' | 'PYTH';
export type NetworkId = 1 | 5 | 420 | 10 | 42 | 69 | 31337;
export type NetworkOverrideOptions = {
    networkId: NetworkId;
    provider: ethers.providers.Provider;
};
export declare enum TransactionStatus {
    AwaitingExecution = "AwaitingExecution",
    Executed = "Executed",
    Confirmed = "Confirmed",
    Failed = "Failed"
}
export declare const NetworkIdByName: {
    readonly mainnet: 1;
    readonly goerli: 5;
    readonly 'goerli-ovm': 420;
    readonly 'mainnet-ovm': 10;
    readonly kovan: 42;
    readonly 'kovan-ovm': 69;
    readonly 'mainnet-fork': 31337;
};
export declare const NetworkNameById: {
    readonly 1: "mainnet";
    readonly 5: "goerli";
    readonly 42: "kovan";
    readonly 10: "mainnet-ovm";
    readonly 69: "kovan-ovm";
    readonly 420: "goerli-ovm";
    readonly 31337: "mainnet-fork";
};
export type CurrencyKey = string;
