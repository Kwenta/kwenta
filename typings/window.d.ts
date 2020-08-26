import { ethers } from 'ethers';
import { NetworkIds } from '@synthetixio/js';

declare global {
	interface Window {
		web3?: {
			eth?: {
				net: {
					getId: () => NetworkIds;
				};
			};
			version: {
				getNetwork(cb: (err: Error | undefined, networkId: NetworkIds) => void): void;
				network: NetworkIds;
			};
		};
		ethereum?: {
			on: (event: string, cb: () => void) => void;
			ethereum: ethers.providers.Provider | undefined;
			networkVersion: NetworkIds;
			isMetaMask: boolean;
		};
	}
}
