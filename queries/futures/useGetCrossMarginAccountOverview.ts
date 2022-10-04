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
			if (!crossMarginAddress || !crossMarginAccountContract) {
				setAccountOverview({
					freeMargin: zeroBN,
					keeperEthBal: zeroBN,
				});
				return { freeMargin: zeroBN, keeperEthBal: zeroBN };
			}

			const freeMargin = await crossMarginAccountContract.freeMargin();
			const tradeFee = await crossMarginBaseSettings?.tradeFee();
			const limitOrderFee = await crossMarginBaseSettings?.limitOrderFee();
			const stopOrderFee = await crossMarginBaseSettings?.stopOrderFee();
			const keeperEthBal = await provider.getBalance(crossMarginAddress);

			const settings = {
				tradeFee: tradeFee ? wei(tradeFee.toNumber() / BPS_CONVERSION) : zeroBN,
				limitOrderFee: limitOrderFee ? wei(limitOrderFee.toNumber() / BPS_CONVERSION) : zeroBN,
				stopOrderFee: stopOrderFee ? wei(stopOrderFee.toNumber() / BPS_CONVERSION) : zeroBN,
			};

			setAccountOverview({
				freeMargin: wei(freeMargin),
				keeperEthBal: wei(keeperEthBal),
			});
			setCrossMarginSettings(settings);

			return { freeMargin: wei(freeMargin), settings: settings, keeperEthBal };
		},
		{
			enabled: !!crossMarginAddress,
		}
	);
}
