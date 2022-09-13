import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useQuery } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import {
	crossMarginAvailableMarginState,
	crossMarginSettingsState,
	futuresAccountState,
} from 'store/futures';
import { zeroBN } from 'utils/formatters/number';

export default function useGetCrossMarginAccountOverview() {
	const { network } = Connector.useContainer();
	const { crossMarginAddress } = useRecoilValue(futuresAccountState);
	const setFreeMargin = useSetRecoilState(crossMarginAvailableMarginState);
	const setCrossMarginSettings = useSetRecoilState(crossMarginSettingsState);

	const { crossMarginAccountContract, crossMarginBaseSettings } = useCrossMarginAccountContracts();

	return useQuery(
		QUERY_KEYS.Futures.CrossMarginAccountOverview(
			network.id as NetworkId,
			crossMarginAddress || '',
			crossMarginAccountContract?.address || ''
		),
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
			enabled: !!crossMarginAddress,
		}
	);
}
