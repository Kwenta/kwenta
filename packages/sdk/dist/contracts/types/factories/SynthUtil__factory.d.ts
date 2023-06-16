import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { SynthUtil, SynthUtilInterface } from "../SynthUtil";
export declare class SynthUtil__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        payable: boolean;
        stateMutability: string;
        type: string;
        constant?: undefined;
        name?: undefined;
        outputs?: undefined;
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
    })[];
    static createInterface(): SynthUtilInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): SynthUtil;
}
