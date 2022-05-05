import React from 'react';
import styled from 'styled-components';
import Table from 'components/Table';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { CellProps } from 'react-table';
import Currency from 'components/Currency';
import { getDisplayAsset } from 'utils/futures';
import { wei } from '@synthetixio/wei';
import { PositionSide } from '../types';
import PositionType from 'components/Text/PositionType';
import { formatCurrency } from 'utils/formatters/number';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import { gasSpeedState, walletAddressState } from 'store/wallet';
import TransactionNotifier from 'containers/TransactionNotifier';
import { FuturesPosition } from 'queries/futures/types';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';
import Badge from 'components/Badge';

type OpenOrdersTableProps = {
	currencyKey: CurrencyKey;
	position: FuturesPosition | null;
	openOrders: any[];
	refetch(): void;
};

const OpenOrdersTable: React.FC<OpenOrdersTableProps> = ({
	currencyKey,
	position,
	openOrders,
	refetch,
}) => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { useSynthetixTxn, useEthGasPriceQuery } = useSynthetixQueries();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const walletAddress = useRecoilValue(walletAddressState);

	const [action, setAction] = React.useState<'' | 'cancel' | 'execute'>('');

	const ethGasPriceQuery = useEthGasPriceQuery();

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : undefined;

	const nextPriceDetailsQuery = useGetNextPriceDetails(currencyKey, { refetchInterval: 6000 });
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
					setTimeout(async () => {
						refetch();
					}, 5 * 1000);
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
		<StyledTable
			data={data}
			highlightRowsOnHover
			showPagination
			columns={[
				{
					Header: (
						<StyledTableHeader>
							{t('futures.market.user.open-orders.table.market-type')}
						</StyledTableHeader>
					),
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
									{cellProps.row.original.isStale && (
										<ExpiredBadge>
											{t('futures.market.user.open-orders.badges.expired')}
										</ExpiredBadge>
									)}
								</StyledText>
								<StyledValue>{cellProps.row.original.orderType}</StyledValue>
							</MarketContainer>
						);
					},
					sortable: true,
					width: 50,
				},
				{
					Header: (
						<StyledTableHeader>{t('futures.market.user.open-orders.table.side')}</StyledTableHeader>
					),
					accessor: 'side',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<div>
								<PositionType side={cellProps.row.original.side} />
							</div>
						);
					},
					sortable: true,
					width: 50,
				},
				{
					Header: (
						<StyledTableHeader>{t('futures.market.user.open-orders.table.size')}</StyledTableHeader>
					),
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
					sortable: true,
					width: 50,
				},
				// {
				// 	Header: <div>{t('futures.market.user.open-orders.table.parameters')}</div>,
				// 	accessor: 'parameters',
				// 	Cell: (cellProps: CellProps<any>) => {
				// 		return <div>-</div>;
				// 	},
				// },
				{
					Header: (
						<StyledTableHeader>
							{t('futures.market.user.open-orders.table.actions')}
						</StyledTableHeader>
					),
					accessor: 'actions',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<div style={{ display: 'flex' }}>
								<CancelButton
									onClick={() => {
										setAction('cancel');
									}}
								>
									{t('futures.market.user.open-orders.actions.cancel')}
								</CancelButton>
								{cellProps.row.original.isExecutable && (
									<EditButton
										onClick={() => {
											setAction('execute');
										}}
									>
										{t('futures.market.user.open-orders.actions.execute')}
									</EditButton>
								)}
								{/* TODO: This will probably be used for other order types. */}
								{/*<EditButton>{t('futures.market.user.open-orders.actions.edit')}</EditButton>*/}
							</div>
						);
					},
					width: 50,
				},
			]}
		/>
	);
};

const StyledTable = styled(Table)`
	margin-bottom: 20px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
`;

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

const ExpiredBadge = styled(Badge)`
	background: ${(props) => props.theme.colors.common.primaryRed};
	padding: 1px 5px;
	line-height: 9px;
`;

export default OpenOrdersTable;
