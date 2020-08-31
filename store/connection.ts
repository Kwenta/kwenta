import { NetworkIds } from '@synthetixio/js';
import { atom, selector } from 'recoil';

import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { truncateAddress } from 'utils/formatters/string';

const getKey = (subKey: string) => `connection/${subKey}`;

export const networkIdState = atom<NetworkIds>({
	key: getKey('networkId'),
	default: DEFAULT_NETWORK_ID,
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
