import { ethers } from 'ethers';
import { NetworkId } from '../types/common';
export declare const computeGasFee: (baseFeePerGas: ethers.BigNumber, maxPriorityFeePerGas: number) => {
    maxPriorityFeePerGas: ethers.BigNumber;
    maxFeePerGas: ethers.BigNumber;
    baseFeePerGas: ethers.BigNumber;
};
export declare const getGasPriceFromProvider: (provider: ethers.providers.Provider) => Promise<{
    fastest: {
        gasPrice: ethers.BigNumber;
    };
    fast: {
        gasPrice: ethers.BigNumber;
    };
    average: {
        gasPrice: ethers.BigNumber;
    };
}>;
export declare const getEthGasPrice: (networkId: NetworkId, provider: ethers.providers.Provider) => Promise<{
    fastest: {
        gasPrice: ethers.BigNumber;
    };
    fast: {
        gasPrice: ethers.BigNumber;
    };
    average: {
        gasPrice: ethers.BigNumber;
    };
} | {
    fastest: {
        maxPriorityFeePerGas: ethers.BigNumber;
        maxFeePerGas: ethers.BigNumber;
        baseFeePerGas: ethers.BigNumber;
    };
    fast: {
        maxPriorityFeePerGas: ethers.BigNumber;
        maxFeePerGas: ethers.BigNumber;
        baseFeePerGas: ethers.BigNumber;
    };
    average: {
        maxPriorityFeePerGas: ethers.BigNumber;
        maxFeePerGas: ethers.BigNumber;
        baseFeePerGas: ethers.BigNumber;
    };
}>;
