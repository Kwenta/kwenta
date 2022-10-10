import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useQuery } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import {
	crossMarginAccountOverviewState,
	crossMarginSettingsState,
	futuresAccountState,
} from 'store/futures';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

const BPS_CONVERSION = 10000;

export default function useGetCrossMarginAccountOverview() {
	const { network, provider } = Connector.useContainer();
	const { crossMarginAddress } = useRecoilValue(futuresAccountState);
	const setCrossMarginSettings = useSetRecoilState(crossMarginSettingsState);
	const setAccountOverview = useSetRecoilState(crossMarginAccountOverviewState);

	const { crossMarginAccountContract, crossMarginBaseSettings } = useCrossMarginAccountContracts();

	return useQuery(
		QUERY_KEYS.Futures.CrossMarginAccountOverview(
			network.id as NetworkId,
			crossMarginAddress || '',
			crossMarginAccountContract?.address || ''
		),
		async () => {
			if (!crossMarginAddress || !crossMarginAccountContract || !crossMarginBaseSettings) {
				setAccountOverview({
					freeMargin: zeroBN,
					keeperEthBal: zeroBN,
				});
				return { freeMargin: zeroBN, keeperEthBal: zeroBN };
			}

			Promise.all([
				crossMarginAccountContract.freeMargin(),
				provider.getBalance(crossMarginAddress),
			])
				.then(([freeMargin, keeperEthBal]) => {
					setAccountOverview({
						freeMargin: wei(freeMargin),
						keeperEthBal: wei(keeperEthBal),
					});
				})
				.catch((err) => logError(err));

			Promise.all([
				crossMarginBaseSettings?.tradeFee(),
				crossMarginBaseSettings?.limitOrderFee(),
				crossMarginBaseSettings?.stopOrderFee(),
			])
				.then(([tradeFee, limitOrderFee, stopOrderFee]) => {
					const settings = {
						tradeFee: tradeFee ? wei(tradeFee.toNumber() / BPS_CONVERSION) : zeroBN,
						limitOrderFee: limitOrderFee ? wei(limitOrderFee.toNumber() / BPS_CONVERSION) : zeroBN,
						stopOrderFee: stopOrderFee ? wei(stopOrderFee.toNumber() / BPS_CONVERSION) : zeroBN,
					};
					setCrossMarginSettings(settings);
				})
				.catch((err) => logError(err));
		}
	);
}
