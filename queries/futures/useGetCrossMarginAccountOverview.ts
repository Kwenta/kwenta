import { wei } from '@synthetixio/wei';
import { useQuery } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import { appReadyState } from 'store/app';
import {
	crossMarginAvailableMarginState,
	crossMarginSettingsState,
	futuresAccountState,
} from 'store/futures';
import { isL2State, networkState } from 'store/wallet';
import { zeroBN } from 'utils/formatters/number';

export default function useGetCrossMarginAccountOverview() {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const { crossMarginAddress } = useRecoilValue(futuresAccountState);
	const setFreeMargin = useSetRecoilState(crossMarginAvailableMarginState);
	const setCrossMarginSettings = useSetRecoilState(crossMarginSettingsState);

	const { crossMarginAccountContract, crossMarginBaseSettings } = useCrossMarginAccountContracts();

	return useQuery(
		QUERY_KEYS.Futures.CrossMarginAccountOverview(network.id, crossMarginAddress || ''),
		async () => {
			if (!crossMarginAddress || !crossMarginAccountContract) {
				setFreeMargin(zeroBN);
				return { freeMargin: zeroBN };
			}

			const freeMargin = await crossMarginAccountContract.freeMargin();
			const tradeFee = await crossMarginBaseSettings?.tradeFee();
			const limitOrderFee = await crossMarginBaseSettings?.limitOrderFee();
			const stopLossFee = await crossMarginBaseSettings?.stopLossFee();

			const settings = {
				tradeFee: tradeFee ? wei(tradeFee.toNumber() / 10000) : zeroBN,
				limitOrderFee: limitOrderFee ? wei(limitOrderFee.toNumber() / 10000) : zeroBN,
				stopLossFee: stopLossFee ? wei(stopLossFee.toNumber() / 1000) : zeroBN,
			};

			setFreeMargin(wei(freeMargin));
			setCrossMarginSettings(settings);

			return { freeMargin: wei(freeMargin), settings: settings };
		},
		{
			enabled: isAppReady && isL2,
		}
	);
}
