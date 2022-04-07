import { NetworkId, NetworkIdByName } from '@synthetixio/contracts-interface';

import futuresMarketsKovan from 'synthetix/publish/deployed/kovan-ovm/futures-markets.json';
import futuresMarketsMainnet from 'synthetix/publish/deployed/mainnet-ovm/futures-markets.json';

export const getMarketKey = (asset: string | null, networkId: NetworkId) => {
	if (networkId === NetworkIdByName['mainnet-ovm']) {
		return futuresMarketsMainnet.find((market) => market.asset === asset)?.marketKey || 'sETH';
	} else if (networkId === NetworkIdByName['kovan-ovm']) {
		return futuresMarketsKovan.find((market) => market.asset === asset)?.marketKey || 'sETH';
	} else {
		return 'sETH';
	}
};

export const getDisplayAsset = (asset: string | null, networkId: NetworkId) => {
	return asset ? (asset[0] === 's' ? asset.slice(1) : asset) : null;
};
