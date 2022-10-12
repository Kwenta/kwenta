import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useQuery } from 'react-query';
import { useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import { crossMarginSettingsState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

const BPS_CONVERSION = 10000;

export default function useGetCrossMarginSettings() {
	const { network } = Connector.useContainer();
	const setCrossMarginSettings = useSetRecoilState(crossMarginSettingsState);

	const { crossMarginBaseSettings } = useCrossMarginAccountContracts();

	return useQuery(
		QUERY_KEYS.Futures.CrossMarginSettings(
			network.id as NetworkId,
			crossMarginBaseSettings?.address ?? ''
		),
		async () => {
			if (!crossMarginBaseSettings) {
				return;
			}

			try {
				const [tradeFee, limitOrderFee, stopOrderFee] = await Promise.all([
					crossMarginBaseSettings?.tradeFee(),
					crossMarginBaseSettings?.limitOrderFee(),
					crossMarginBaseSettings?.stopOrderFee(),
				]);
				const settings = {
					tradeFee: tradeFee ? wei(tradeFee.toNumber() / BPS_CONVERSION) : zeroBN,
					limitOrderFee: limitOrderFee ? wei(limitOrderFee.toNumber() / BPS_CONVERSION) : zeroBN,
					stopOrderFee: stopOrderFee ? wei(stopOrderFee.toNumber() / BPS_CONVERSION) : zeroBN,
				};
				setCrossMarginSettings(settings);

				return;
			} catch (err) {
				logError(err);
			}
		}
	);
}
