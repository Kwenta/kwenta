import useSynthetixQueries from '@synthetixio/queries';
import { CurrencyKey } from 'constants/currency';

import { SynthSuspensionReason } from '@synthetixio/queries';
import { useEffect, useState } from 'react';
import { utils } from 'ethers';
import SystemStatus from 'sections/shared/SystemStatus';
import { getMarketKey } from 'utils/futures';
import { useRecoilValue } from 'recoil';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';
import Connector from 'containers/Connector';
import { getReasonFromCode } from 'queries/futures/utils';

export type MarketClosureReason = 'frozen' | SynthSuspensionReason;
export type MarketClosure = ReturnType<typeof useMarketClosed>;

const useMarketClosed = (currencyKey: CurrencyKey | null) => {
	const { useSynthSuspensionQuery } = useSynthetixQueries();

	const currencySuspendedQuery = useSynthSuspensionQuery(currencyKey);

	const isCurrencySuspended =
		currencySuspendedQuery.isSuccess && currencySuspendedQuery.data
			? currencySuspendedQuery.data.isSuspended
			: false;

	return {
		isMarketClosed: isCurrencySuspended,
		isCurrencySuspended,
		marketClosureReason: currencySuspendedQuery.data?.reason as MarketClosureReason,
	};
};

export const useFuturesMarketClosed = (currencyKey: CurrencyKey | null) => {
	const [isMarketClosed, setIsMarketClosed] = useState(false);
	const [marketClosureReason, setMarketClosureReason] = useState<MarketClosureReason>();
	const { synthetixjs } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);

	useEffect(() => {
		if (!synthetixjs && isWalletConnected && !isL2) {
			return null;
		}

		async function getMarketSuspended() {
			const {
				contracts: { SystemStatus },
			} = synthetixjs!;
			const marketKey = getMarketKey(currencyKey, network.id);
			const market = utils.formatBytes32String(marketKey);

			const { suspensions, reasons } = await SystemStatus.getFuturesMarketSuspensions([market]);
			const reason = getReasonFromCode(reasons[0]);
			setIsMarketClosed(suspensions[0]);
			setMarketClosureReason(reason || undefined);
		}

		getMarketSuspended();
	}, [synthetixjs]);

	return {
		isMarketClosed,
		marketClosureReason,
	};
};

export default useMarketClosed;
