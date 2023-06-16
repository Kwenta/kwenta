import { NetworkId } from '../types/common';
export type SynthSymbol = 'sAAVE' | 'sADA' | 'sAUD' | 'sBTC' | 'sCHF' | 'sDOT' | 'sETH' | 'sETHBTC' | 'sEUR' | 'sGBP' | 'sINR' | 'sJPY' | 'sKRW' | 'sLINK' | 'sUSD';
export type SynthToken = {
    name: SynthSymbol;
    description: string;
    asset: string;
    address: string;
    decimals: 18;
    category: 'crypto' | 'forex';
};
export type SynthsMap = Partial<Record<SynthSymbol, SynthToken>>;
type BasicSynth = {
    name: string;
    asset: string;
    addresses: Partial<Record<NetworkId, string>>;
    category: 'crypto' | 'forex';
};
export declare const synths: Record<SynthSymbol, BasicSynth>;
export declare const getSynthsForNetwork: (networkId: NetworkId) => Partial<Record<SynthSymbol, SynthToken>>;
export declare const getSynthsListForNetwork: (networkId: NetworkId) => SynthToken[];
export {};
