import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useQuery } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useSUSDContract from 'hooks/useSUSDContract';
import { crossMarginAccountOverviewState, futuresAccountState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

export default function useGetCrossMarginAccountOverview() {
	const { walletAddress, network, provider } = Connector.useContainer();
	const { crossMarginAddress } = useRecoilValue(futuresAccountState);
	const setAccountOverview = useSetRecoilState(crossMarginAccountOverviewState);

	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const susdContract = useSUSDContract();

	return useQuery(
		QUERY_KEYS.Futures.CrossMarginAccountOverview(
			network.id as NetworkId,
			crossMarginAddress || ''
		),
		async () => {
			if (!crossMarginAddress || !crossMarginAccountContract || !susdContract || !walletAddress) {
				setAccountOverview({
					freeMargin: zeroBN,
					keeperEthBal: zeroBN,
					allowance: zeroBN,
				});
				return;
			}

			try {
				const [freeMargin, keeperEthBal, allowance] = await Promise.all([
					crossMarginAccountContract.freeMargin(),
					provider.getBalance(crossMarginAddress),
					susdContract.allowance(walletAddress, crossMarginAccountContract.address),
				]);

				setAccountOverview({
					freeMargin: wei(freeMargin),
					keeperEthBal: wei(keeperEthBal),
					allowance: wei(allowance),
				});

				return;
			} catch (err) {
				logError(err);
			}
		}
	);
}
