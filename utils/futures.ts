import { NetworkId, NetworkIdByName, Synth } from '@synthetixio/contracts-interface';
import { TFunction } from 'i18next';
import { Dictionary } from 'lodash';

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

export const getDisplayAsset = (asset: string | null) => {
	return asset ? (asset[0] === 's' ? asset.slice(1) : asset) : null;
};

export const getSynthDescription = (synth: string, synthsMap: Dictionary<Synth>, t: TFunction) => {
	const parsedSynthKey = synth ? (synth[0] !== 's' ? `s${synth}` : synth) : '';

	switch (parsedSynthKey) {
		case 'sWTI':
			return t('common.currency.futures-market-oil-short-name');
		case 'sXAU':
			return t('common.currency.futures-market-gold-short-name');
		case 'sXAG':
			return t('common.currency.futures-market-silver-short-name');
		default:
			return t('common.currency.futures-market-short-name', {
				currencyName:
					parsedSynthKey && synthsMap[parsedSynthKey] ? synthsMap[parsedSynthKey].description : '',
			});
	}
};
