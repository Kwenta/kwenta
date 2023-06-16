import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ReverseRecords, ReverseRecordsInterface } from "../ReverseRecords";
export declare class ReverseRecords__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        name?: undefined;
        outputs?: undefined;
    } | {
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
        stateMutability: string;
        type: string;
    })[];
    static createInterface(): ReverseRecordsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ReverseRecords;
}
