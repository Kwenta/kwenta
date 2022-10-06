import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import Connector from 'containers/Connector';
import { positionHistoryState } from 'store/futures';

import { FuturesAccountTypes, PositionHistoryState } from './types';
import useGetFuturesPositionHistoryForAccount from './useGetFuturesPositionHistoryForAccount';

const DEFAULT_POSITION_HISTORY: PositionHistoryState = {
	[FuturesAccountTypes.CROSS_MARGIN]: [],
	[FuturesAccountTypes.ISOLATED_MARGIN]: [],
};

const useGetFuturesPositionHistory = () => {
	const { walletAddress } = Connector.useContainer();

	const setPositionHistory = useSetRecoilState(positionHistoryState);
	const positionHistoryQuery = useGetFuturesPositionHistoryForAccount(walletAddress);

	useEffect(() => {
		const positionHistory = positionHistoryQuery.data ?? DEFAULT_POSITION_HISTORY;
		setPositionHistory(positionHistory);
	}, [positionHistoryQuery.data, setPositionHistory]);

	return positionHistoryQuery;
};

export default useGetFuturesPositionHistory;
