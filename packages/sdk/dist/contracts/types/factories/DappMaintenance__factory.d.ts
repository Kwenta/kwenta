import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { DappMaintenance, DappMaintenanceInterface } from "../DappMaintenance";
export declare class DappMaintenance__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        payable: boolean;
        stateMutability: string;
        type: string;
        anonymous?: undefined;
        name?: undefined;
        constant?: undefined;
        outputs?: undefined;
    } | {
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        payable?: undefined;
        stateMutability?: undefined;
        constant?: undefined;
        outputs?: undefined;
    } | {
        constant: boolean;
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        payable: boolean;
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    } | {
        constant: boolean;
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        payable: boolean;
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
    static createInterface(): DappMaintenanceInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DappMaintenance;
}
