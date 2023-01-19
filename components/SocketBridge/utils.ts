import { chain } from 'wagmi';

import { ADDRESSES } from 'sdk/contracts/constants';

import { RGB } from './types';

export const DEFAULT_WIDTH = 360;
export const DEFAULT_MOBILE_WIDTH = 180;
export const SOCKET_SOURCE_TOKEN_ADDRESS =
	ADDRESSES.SUSD[chain.mainnet.id] || '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const SOCKET_DEST_TOKEN_ADDRESS = ADDRESSES.SUSD[chain.optimism.id];

export default function hexToRGB(hex: string): RGB {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return {
		r,
		g,
		b,
	};
}
