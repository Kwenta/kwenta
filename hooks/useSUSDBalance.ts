import useSynthetixQueries from '@synthetixio/queries';

import Connector from 'containers/Connector';
import { zeroBN } from 'utils/formatters/number';

export default function useSUSDBalance(address?: string) {
	const { walletAddress } = Connector.useContainer();

	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(address || walletAddress);
	return synthsBalancesQuery?.data?.balancesMap?.['sUSD']?.balance ?? zeroBN;
}
