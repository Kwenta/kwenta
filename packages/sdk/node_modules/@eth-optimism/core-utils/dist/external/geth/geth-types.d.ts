export interface State {
    [address: string]: {
        nonce?: string;
        balance?: string;
        codeHash?: string;
        root?: string;
        code?: string;
        storage?: {
            [key: string]: string;
        };
        secretKey?: string;
    };
}
export interface ChainConfig {
    chainId: number;
    homesteadBlock: number;
    eip150Block: number;
    eip150Hash?: string;
    eip155Block: number;
    eip158Block: number;
    byzantiumBlock: number;
    constantinopleBlock: number;
    petersburgBlock: number;
    istanbulBlock: number;
    muirGlacierBlock: number;
    berlinBlock: number;
    londonBlock?: number;
    arrowGlacierBlock?: number;
    grayGlacierBlock?: number;
    mergeNetsplitBlock?: number;
    terminalTotalDifficulty?: number;
    clique?: {
        period: number;
        epoch: number;
    };
    ethash?: {};
}
export interface Genesis {
    config: ChainConfig;
    nonce?: string;
    timestamp?: string;
    difficulty: string;
    mixHash?: string;
    coinbase?: string;
    number?: string;
    gasLimit: string;
    gasUsed?: string;
    parentHash?: string;
    extraData: string;
    baseFeePerGas?: string;
    alloc: State;
}
export interface OptimismChainConfig extends ChainConfig {
    optimism: {
        baseFeeRecipient: string;
        l1FeeRecipient: string;
    };
}
export interface OptimismGenesis extends Genesis {
    config: OptimismChainConfig;
}
