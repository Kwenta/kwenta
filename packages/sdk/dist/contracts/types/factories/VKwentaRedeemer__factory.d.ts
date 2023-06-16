import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { VKwentaRedeemer, VKwentaRedeemerInterface } from "../VKwentaRedeemer";
export declare class VKwentaRedeemer__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
        name?: undefined;
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
        stateMutability?: undefined;
        outputs?: undefined;
    } | {
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
    static createInterface(): VKwentaRedeemerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): VKwentaRedeemer;
}
