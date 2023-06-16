import { ethers, Contract } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
export declare const deployAndVerifyAndThen: ({ hre, name, args, contract, iface, postDeployAction, }: {
    hre: any;
    name: string;
    args: any[];
    contract?: string;
    iface?: string;
    postDeployAction?: (contract: Contract) => Promise<void>;
}) => Promise<void>;
export declare const getAdvancedContract: (opts: {
    hre: any;
    contract: Contract;
}) => Contract;
export declare const fundAccount: (hre: any, address: string, amount: ethers.BigNumber) => Promise<void>;
export declare const sendImpersonatedTx: (opts: {
    hre: any;
    contract: ethers.Contract;
    fn: string;
    from: string;
    gas: string;
    args: any[];
}) => Promise<void>;
export declare const getContractFromArtifact: (hre: any, name: string, options?: {
    iface?: string;
    signerOrProvider?: Signer | Provider | string;
}) => Promise<ethers.Contract>;
export declare const isHardhatNode: (hre: any) => Promise<boolean>;
export declare const BIG_BALANCE: ethers.BigNumber;
