import { BigNumber } from '@ethersproject/bignumber';
export declare const getProxySynthSymbol: (address: string) => any;
export declare const getReasonFromCode: (reasonCode: BigNumber | number) => "system-upgrade" | "market-closure" | "circuit-breaker" | "emergency";
export type MarketClosureReason = ReturnType<typeof getReasonFromCode>;
