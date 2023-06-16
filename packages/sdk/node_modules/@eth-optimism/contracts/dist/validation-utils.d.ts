export declare const getInput: (query: any) => Promise<unknown>;
export declare const color: any;
export declare const getArtifactFromManagedName: (name: string) => any;
export declare const getEtherscanUrl: (network: any, address: string) => string;
export declare const printSectionHead: (msg: string) => void;
export declare const printComparison: (action: string, description: string, expected: {
    name: string;
    value: any;
}, deployed: {
    name: string;
    value: any;
}) => void;
