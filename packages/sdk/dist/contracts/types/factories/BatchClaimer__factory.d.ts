import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { BatchClaimer, BatchClaimerInterface } from "../BatchClaimer";
export declare class BatchClaimer__factory {
    static readonly abi: {
        inputs: ({
            internalType: string;
            name: string;
            type: string;
            components?: undefined;
        } | {
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
            internalType: string;
            name: string;
            type: string;
        })[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): BatchClaimerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): BatchClaimer;
}
