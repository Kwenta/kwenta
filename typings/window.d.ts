import { NetworkId } from 'utils/networkUtils';

declare global {
	interface Window {
		web3?: {
			eth?: {
				net: {
					getId: () => NetworkId;
				};
			};
			version: {
				getNetwork(cb: (err: Error | undefined, networkId: string) => void): void;
				network: NetworkId;
			};
		};
		ethereum?: {
			on: (event: string, cb: () => void) => void;
			networkVersion: NetworkId;
			ethereum: Provider | undefined;
		};
	}
}
