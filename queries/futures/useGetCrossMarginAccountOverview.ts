import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useState } from 'react';
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
	const [retryCount, setRetryCount] = useState(0);

	return useQuery(
		QUERY_KEYS.Futures.CrossMarginAccountOverview(
			network.id as NetworkId,
			crossMarginAddress || '',
			retryCount
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
				setRetryCount(0);
				setAccountOverview(overview);

				return overview;
			} catch (err) {
				// This a hacky workaround to deal with the delayed Metamask error
				// which causes the logs query to fail on network switching
				// https://github.com/MetaMask/metamask-extension/issues/13375#issuecomment-1046125113
				if (retryCount < 2) {
					setRetryCount(retryCount + 1);
				}
				logError(err);
			}
		}
	);
}
