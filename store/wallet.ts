import { NetworkId, Network as NetworkName } from '@synthetixio/js';
import { atom, selector } from 'recoil';

import { truncateAddress } from 'utils/formatters/string';

export type Network = {
	id: NetworkId;
	name: NetworkName;
};

const getKey = (subKey: string) => `wallet/${subKey}`;

export const networkState = atom<Network | null>({
	key: getKey('network'),
	default: null,
});

export const walletAddressState = atom<string | null>({
	key: getKey('walletAddress'),
	default: null,
});

export const isWalletConnectedState = selector<boolean>({
	key: getKey('isWalletConnected'),
	get: ({ get }) => get(walletAddressState) != null,
});

export const truncatedWalletAddressState = selector<string | null>({
	key: getKey('truncatedWalletAddress'),
	get: ({ get }) => {
		const walletAddress = get(walletAddressState);
		if (walletAddress != null) {
			return truncateAddress(walletAddress);
		}
		return walletAddress;
	},
});
