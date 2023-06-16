export declare const RATES_ENDPOINT_OP_MAINNET: string;
export declare const RATES_ENDPOINT_OP_GOERLI = "https://api.thegraph.com/subgraphs/name/kwenta/optimism-goerli-latest-rates";
export declare const RATES_ENDPOINT_GOERLI = "https://api.thegraph.com/subgraphs/name/kwenta/goerli-main";
export declare const RATES_ENDPOINTS: Record<number, string>;
export declare const getRatesEndpoint: (networkId: number) => string;
