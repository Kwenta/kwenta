import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { FuturesMarketSettings, FuturesMarketSettingsInterface } from "../FuturesMarketSettings";
export declare class FuturesMarketSettings__factory {
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
        "payab`le"?: undefined;
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
        "payab`le"?: undefined;
    } | {
        constant: boolean;
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
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
        "payab`le"?: undefined;
    } | {
        constant: boolean;
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        "payab`le": boolean;
        stateMutability: string;
        type: string;
        payable?: undefined;
        anonymous?: undefined;
    })[];
    static createInterface(): FuturesMarketSettingsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): FuturesMarketSettings;
}
