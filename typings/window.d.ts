import { ethers } from 'ethers';

declare global {
	interface Window {
		ethereum?: {
			on: (event: string, cb: () => void) => void;
			ethereum: ethers.providers.Provider | undefined;
		};
	}
}
