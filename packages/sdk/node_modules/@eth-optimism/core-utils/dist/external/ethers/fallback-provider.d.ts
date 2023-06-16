import { Provider, FallbackProvider as EthersFallbackProvider } from '@ethersproject/providers';
export interface HttpHeaders {
    [key: string]: string;
}
export interface FallbackProviderConfig {
    provider: Provider;
    priority?: number;
    stallTimeout?: number;
    weight?: number;
}
export declare const FallbackProvider: (config: string | FallbackProviderConfig[], headers?: HttpHeaders) => EthersFallbackProvider;
