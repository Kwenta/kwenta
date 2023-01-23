import { NetworkId, NetworkName } from '@synthetixio/contracts-interface';
import { GasSpeed } from '@synthetixio/queries';
import { atom } from 'recoil';

import { getWalletKey } from '../utils';

export type Network = {
	id: NetworkId;
	name: NetworkName;
	useOvm?: boolean;
};

export const gasSpeedState = atom<GasSpeed>({
	key: getWalletKey('gasSpeed'),
	default: 'fast',
});

export const customGasPriceState = atom<string>({
	key: getWalletKey('customGasPrice'),
	default: '',
});
