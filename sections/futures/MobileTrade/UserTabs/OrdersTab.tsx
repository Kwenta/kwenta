import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';
import TransactionNotifier from 'containers/TransactionNotifier';
import { wei } from '@synthetixio/wei';
import { positionState, currentMarketState, openOrdersState } from 'store/futures';
import { gasSpeedState, walletAddressState } from 'store/wallet';
import { getDisplayAsset } from 'utils/futures';
import { SectionHeader } from '../common';
import { PositionSide } from 'queries/futures/types';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';
import RefetchContext from 'contexts/RefetchContext';

const OrdersTab: React.FC = () => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { useSynthetixTxn, useEthGasPriceQuery } = useSynthetixQueries();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const position = useRecoilValue(positionState);
	const currencyKey = useRecoilValue(currentMarketState);
	const openOrders = useRecoilValue(openOrdersState);

	const { handleRefetch } = React.useContext(RefetchContext);

	const [action, setAction] = React.useState<'' | 'cancel' | 'execute'>('');

	const ethGasPriceQuery = useEthGasPriceQuery();

	const gasPrice = ethGasPriceQuery.data?.[gasSpeed];

	const nextPriceDetailsQuery = useGetNextPriceDetails();
	const nextPriceDetails = nextPriceDetailsQuery.data;

	const cancelOrExecuteOrderTxn = useSynthetixTxn(
		`FuturesMarket${getDisplayAsset(currencyKey)}`,
		`${action}NextPriceOrder`,
		[walletAddress],
		gasPrice,
		{
			enabled: !!action,
			onSettled: () => {
				setAction('');
			},
		}
	);

	React.useEffect(() => {
		if (!!action) {
			cancelOrExecuteOrderTxn.mutate();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [action]);

	React.useEffect(() => {
		if (cancelOrExecuteOrderTxn.hash) {
			monitorTransaction({
				txHash: cancelOrExecuteOrderTxn.hash,
				onTxConfirmed: () => {
					handleRefetch('new-order');
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cancelOrExecuteOrderTxn.hash]);

	const data = React.useMemo(() => {
		const positionSize = position?.position?.notionalValue ?? wei(0);

		return openOrders.map((order: any) => ({
			asset: order.asset,
			market: getDisplayAsset(order.asset) + '-PERP',
			orderType: order.orderType === 'NextPrice' ? 'Next-Price' : order.orderType,
			size: order.size,
			side: positionSize.add(wei(order.size)).gt(0) ? PositionSide.LONG : PositionSide.SHORT,
			isStale: wei(nextPriceDetails?.currentRoundId ?? 0).gte(wei(order.targetRoundId).add(2)),
			isExecutable:
				wei(nextPriceDetails?.currentRoundId ?? 0).eq(order.targetRoundId) ||
				wei(nextPriceDetails?.currentRoundId ?? 0).eq(order.targetRoundId.add(1)),
			timestamp: order.timestamp,
		}));
	}, [openOrders, position, nextPriceDetails?.currentRoundId]);

	return (
		<div>
			<SectionHeader>Orders</SectionHeader>
		</div>
	);
};

export default OrdersTab;
