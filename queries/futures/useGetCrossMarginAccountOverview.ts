import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useQuery } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import { crossMarginAccountOverviewState, futuresAccountState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

export default function useGetCrossMarginAccountOverview() {
	const { network, provider } = Connector.useContainer();
	const { crossMarginAddress } = useRecoilValue(futuresAccountState);
	const setAccountOverview = useSetRecoilState(crossMarginAccountOverviewState);

	const { crossMarginAccountContract } = useCrossMarginAccountContracts();

	return useQuery(
		QUERY_KEYS.Futures.CrossMarginAccountOverview(
			network.id as NetworkId,
			crossMarginAddress || ''
		),
		async () => {
			if (!crossMarginAddress || !crossMarginAccountContract) {
				const overview = {
					freeMargin: zeroBN,
					keeperEthBal: zeroBN,
				};
				setAccountOverview(overview);
				return overview;
			}

			try {
				const [freeMargin, keeperEthBal] = await Promise.all([
					crossMarginAccountContract.freeMargin(),
					provider.getBalance(crossMarginAddress),
				]);
				const overview = {
					freeMargin: wei(freeMargin),
					keeperEthBal: wei(keeperEthBal),
				};

				setAccountOverview(overview);

				return overview;
			} catch (err) {
				logError(err);
			}
		}
	);
}
