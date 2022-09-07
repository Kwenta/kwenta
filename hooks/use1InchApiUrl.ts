import { NetworkId } from '@synthetixio/contracts-interface';
import { useNetwork } from 'wagmi';

import { EXTERNAL_LINKS } from 'constants/links';

type SupportedNetwork = 'optimism' | 'ethereum';

const SUPPORTED_NETWORKS = {
	1: 'ethereum',
	10: 'optimism',
};

const use1InchApiUrl = () => {
	const { chain: network } = useNetwork();
	const networkName =
		SUPPORTED_NETWORKS[(network?.id as NetworkId) as 1 | 10] || SUPPORTED_NETWORKS[10];

	return EXTERNAL_LINKS.Trading.OneInchApi[networkName as SupportedNetwork];
};

export default use1InchApiUrl;
