import React from 'react';
import styled from 'styled-components';
import Table from 'components/Table';
import useGetFuturesOpenOrders from 'queries/futures/useGetFuturesOpenOrders';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { CellProps } from 'react-table';
import Currency from 'components/Currency';
import MarketBadge from 'components/Badge/MarketBadge';
import { getDisplayAsset, getMarketKey } from 'utils/futures';
import Connector from 'containers/Connector';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import { wei } from '@synthetixio/wei';
import { PositionSide } from '../types';
import PositionType from 'components/Text/PositionType';
import { formatCurrency } from 'utils/formatters/number';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import { gasSpeedState, walletAddressState } from 'store/wallet';
import TransactionNotifier from 'containers/TransactionNotifier';

type OpenOrdersTableProps = {
	currencyKey: CurrencyKey;
};

const OpenOrdersTable: React.FC<OpenOrdersTableProps> = ({ currencyKey }) => {
	const { t } = useTranslation();
	const { network } = Connector.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { useSynthetixTxn, useEthGasPriceQuery } = useSynthetixQueries();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const walletAddress = useRecoilValue(walletAddressState);

	const openOrdersQuery = useGetFuturesOpenOrders(currencyKey);
	const futuresPositionQuery = useGetFuturesPositionForMarket(
		getMarketKey(currencyKey, network.id)
	);

	const [cancelCurrencyKey, setCancelCurrencyKey] = React.useState<string | null>(null);

	const ethGasPriceQuery = useEthGasPriceQuery();

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : undefined;

	const cancelOrderTxn = useSynthetixTxn(
		`FuturesMarket${getDisplayAsset(cancelCurrencyKey)}`,
		'cancelNextPriceOrder',
		[walletAddress],
		gasPrice,
		{
			enabled: !!cancelCurrencyKey && !!walletAddress,
			onSettled: () => setCancelCurrencyKey(null),
		}
	);

	React.useEffect(() => {
		if (!!cancelCurrencyKey) {
			cancelOrderTxn.mutate();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cancelCurrencyKey]);

	React.useEffect(() => {
		if (cancelOrderTxn.hash) {
			monitorTransaction({
				txHash: cancelOrderTxn.hash,
				onTxConfirmed: () => {
					setTimeout(() => {
						openOrdersQuery.refetch();
					}, 5 * 1000);
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cancelOrderTxn.hash]);

	const data = React.useMemo(() => {
		const openOrders = openOrdersQuery?.data ?? [];
		const positionSize = futuresPositionQuery?.data?.position?.notionalValue ?? wei(0);

		return openOrders.map((order) => ({
			asset: order.asset,
			market: getDisplayAsset(order.asset) + '-PERP',
			orderType: order.orderType === 'NextPrice' ? 'Next-Price' : order.orderType,
			size: order.size,
			side: positionSize.add(wei(order.size)).gt(0) ? PositionSide.LONG : PositionSide.SHORT,
			timestamp: order.timestamp,
		}));
	}, [openOrdersQuery, futuresPositionQuery]);

	return (
		<Table
			data={data}
			highlightRowsOnHover
			showPagination
			columns={[
				{
					Header: <div>{t('futures.market.user.open-orders.table.market-type')}</div>,
					accessor: 'market',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<MarketContainer>
								<IconContainer>
									<StyledCurrencyIcon
										currencyKey={
											(cellProps.row.original.asset[0] !== 's' ? 's' : '') +
											cellProps.row.original.asset
										}
									/>
								</IconContainer>
								<StyledText>
									{cellProps.row.original.market}
									<MarketBadge currencyKey={cellProps.row.original.asset} />
								</StyledText>
								<StyledValue>{cellProps.row.original.orderType}</StyledValue>
							</MarketContainer>
						);
					},
					width: 120,
				},
				{
					Header: <div>{t('futures.market.user.open-orders.table.side')}</div>,
					accessor: 'side',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<div>
								<PositionType side={cellProps.row.original.side} />
							</div>
						);
					},
					width: 90,
				},
				{
					Header: <div>{t('futures.market.user.open-orders.table.size')}</div>,
					accessor: 'size',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<div>
								{formatCurrency(cellProps.row.original.asset, cellProps.row.original.size, {
									sign: cellProps.row.original.asset,
								})}
							</div>
						);
					},
				},
				// {
				// 	Header: <div>{t('futures.market.user.open-orders.table.parameters')}</div>,
				// 	accessor: 'parameters',
				// 	Cell: (cellProps: CellProps<any>) => {
				// 		return <div>-</div>;
				// 	},
				// },
				{
					Header: <div>{t('futures.market.user.open-orders.table.actions')}</div>,
					accessor: 'actions',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<div style={{ display: 'flex' }}>
								<CancelButton
									onClick={() => {
										setCancelCurrencyKey(getDisplayAsset(cellProps.row.original.asset));
									}}
								>
									{t('futures.market.user.open-orders.actions.cancel')}
								</CancelButton>
								{/* TODO: This will probably be used for other order types. */}
								{/*<EditButton>{t('futures.market.user.open-orders.actions.edit')}</EditButton>*/}
							</div>
						);
					},
				},
			]}
		/>
	);
};

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`;

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	margin-bottom: -4px;
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

const EditButton = styled.button`
	border: 1px solid ${(props) => props.theme.colors.common.secondaryGray};
	height: 28px;
	box-sizing: border-box;
	border-radius: 14px;
	cursor: pointer;
	background-color: transparent;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	padding-left: 12px;
	padding-right: 12px;
`;

const CancelButton = styled(EditButton)`
	border: 1px solid ${(props) => props.theme.colors.common.primaryRed};
	color: ${(props) => props.theme.colors.common.primaryRed};
	margin-right: 8px;
`;

export default OpenOrdersTable;
