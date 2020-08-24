import { atom, selector } from 'recoil';

import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { NetworkId } from 'constants/network';

const getKey = (subKey: string) => `connectionState/${subKey}`;

export const networkIdState = atom<NetworkId>({
	key: getKey('networkId'),
	default: DEFAULT_NETWORK_ID,
});

export const walletAddressState = atom<string | null>({
	key: getKey('walletAddress'),
	default: null,
});

// export const isWalletConnectedState = selector({
// 	key: getKey('isWalletConnected'),
// 	get: ({ get }) => get(walletAddressState) != null,
// });
