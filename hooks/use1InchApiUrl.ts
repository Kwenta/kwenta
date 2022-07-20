import { useRecoilValue } from 'recoil';

import { EXTERNAL_LINKS } from 'constants/links';
import { networkState } from 'store/wallet';

type SupportedNetwork = 'optimism' | 'ethereum';

const SUPPORTED_NETWORKS = {
	1: 'ethereum',
	10: 'optimism',
};

const use1InchApiUrl = () => {
	const network = useRecoilValue(networkState);
	const networkName = SUPPORTED_NETWORKS[network.id as 1 | 10] || SUPPORTED_NETWORKS[10];

	return EXTERNAL_LINKS.Trading.OneInchApi[networkName as SupportedNetwork];
};

export default use1InchApiUrl;
