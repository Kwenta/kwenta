import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { CellProps } from 'react-table';
import { useTranslation } from 'react-i18next';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';

import Card from 'components/Card';
import Table from 'components/Table';
import Button from 'components/Button';
import { FlexDivCentered, GridDivCenteredRow } from 'styles/common';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { OrderStatus, PositionSide } from '../types';
import { Synths } from 'constants/currency';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { gasSpeedState } from 'store/wallet';

import PendingIcon from 'assets/svg/app/circle-ellipsis.svg';
import SuccessIcon from 'assets/svg/app/circle-tick.svg';
import { getFuturesMarketContract } from 'queries/futures/utils';
import { formatCurrency, formatCryptoCurrency, zeroBN } from 'utils/formatters/number';
import { FuturesPosition } from 'queries/futures/types';
import { formatNumber } from 'utils/formatters/number';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { gasPriceInWei } from 'utils/network';
import { parseGasPriceObject } from 'hooks/useGas';

type OrdersProps = {
	position: FuturesPosition | null;
	currencyKey: string;
	isLoading: boolean;
	isLoaded: boolean;
	currencyKeyRate: number;
	refetchMarketQuery: () => void;
};

type TableOrder = {
	side: PositionSide;
	currencyKey: string;
	leverage: Wei;
	size: Wei;
	fee: Wei;
	isStatusPending: boolean;
};

const Orders: React.FC<OrdersProps> = ({
	position,
	isLoading,
	isLoaded,
	currencyKey,
	currencyKeyRate,
	refetchMarketQuery,
}) => {
	const { t } = useTranslation();
	const { useEthGasPriceQuery } = useSynthetixQueries();
	const { synthetixjs } = Connector.useContainer();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);

	const ethGasPriceQuery = useEthGasPriceQuery();
	const gasPrice = ethGasPriceQuery?.data?.[gasSpeed]
		? parseGasPriceObject(ethGasPriceQuery?.data?.[gasSpeed])
		: null;

	const orders: TableOrder[] = useMemo(
		() =>
			position && position.order
				? [position].map((futuresPosition) => ({
						side: futuresPosition.order?.side ?? PositionSide.LONG,
						currencyKey,
						leverage: futuresPosition.order?.leverage ?? zeroBN,
						size:
							currencyKeyRate && currencyKeyRate > 0
								? position.remainingMargin
										.mul(position.order?.leverage ?? zeroBN)
										.div(wei(currencyKeyRate))
								: zeroBN,
						fee: futuresPosition.order?.fee ?? zeroBN,
						isStatusPending: !!futuresPosition.order?.pending ?? false,
				  }))
				: [],
		[position, currencyKey, currencyKeyRate]
	);

	const columnsDeps = useMemo(() => [orders], [orders]);

	const returnStatusSVG = (isStatusPending: boolean) => {
		if (isStatusPending) {
			return <StatusPendingIcon />;
		} else {
			return <StatusSuccessIcon />;
		}
	};

	const handleCancelOrder = async () => {
		if (!gasPrice) return;
		try {
			const FuturesMarketContract = getFuturesMarketContract(currencyKey, synthetixjs!.contracts);
			const gasEstimate = await FuturesMarketContract.estimateGas.cancelOrder();
			const tx = await FuturesMarketContract.cancelOrder({
				gasLimit: Number(gasEstimate),
				gasPrice: gasPriceInWei(gasPrice),
			});
			if (tx) {
				monitorTransaction({ txHash: tx.hash, onTxConfirmed: refetchMarketQuery });
			}
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<Card>
			<StyledTable
				palette="primary"
				columns={[
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.orders.table.position')}
							</StyledTableHeader>
						),
						accessor: 'size',
						sortType: 'basic',
						Cell: (cellProps: CellProps<TableOrder>) => (
							<FlexDivCentered>
								<CurrencyIcon currencyKey={cellProps.row.original.currencyKey} />
								<StyledPositionSize>
									{formatCryptoCurrency(cellProps.value, {
										currencyKey: cellProps.row.original.currencyKey,
									})}
								</StyledPositionSize>
							</FlexDivCentered>
						),
						width: 200,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.orders.table.leverage')}
							</StyledTableHeader>
						),
						accessor: 'leverage',
						sortType: 'basic',
						Cell: (cellProps: CellProps<TableOrder>) => (
							<FlexDivCentered>
								<LeverageSize>{formatNumber(cellProps.value)}x |</LeverageSize>
								<LeverageSide side={cellProps.row.original.side}>
									{cellProps.row.original.side}
								</LeverageSide>
							</FlexDivCentered>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.orders.table.fee')}</StyledTableHeader>
						),
						accessor: 'fee',
						sortType: 'basic',
						Cell: (cellProps: CellProps<TableOrder>) => (
							<Fee>
								{formatCurrency(Synths.sUSD, cellProps.value, {
									sign: '$',
								})}{' '}
								{selectedPriceCurrency.asset}
							</Fee>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.orders.table.status')}</StyledTableHeader>
						),
						accessor: 'isStatusPending',
						sortType: 'basic',
						Cell: (cellProps: CellProps<TableOrder>) => (
							<FlexDivCentered>
								{returnStatusSVG(cellProps.value)}
								<StatusText>
									{cellProps.value ? OrderStatus.PENDING : OrderStatus.CONFIRMED}
								</StatusText>
							</FlexDivCentered>
						),
						width: 100,
						sortable: true,
					},
					{
						id: 'cancel',
						accessor: 'isStatusPending',
						Cell: (cellProps: CellProps<TableOrder>) => (
							<CancelButton
								onClick={handleCancelOrder}
								isRounded
								variant="danger"
								size="md"
								disabled={!cellProps.value}
							>
								{t('futures.market.user.orders.table.cancel')}
							</CancelButton>
						),
						sortable: false,
						width: 50,
					},
				]}
				data={orders}
				columnsDeps={columnsDeps}
				isLoading={isLoading && !isLoaded}
				noResultsMessage={
					isLoaded && orders.length === 0 ? (
						<TableNoResults>
							<NoNotificationIcon />
							{t('dashboard.transactions.table.no-results')}
						</TableNoResults>
					) : undefined
				}
				showPagination={true}
			/>
		</Card>
	);
};
export default Orders;

const BoldTableText = css`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	text-transform: capitalize;
`;

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
	text-transform: capitalize;
`;

const StyledPositionSize = styled.div`
	margin-left: 4px;
	${BoldTableText}
	text-transform: none;
`;

const LeverageSize = styled.div`
	${BoldTableText}
`;

const LeverageSide = styled.div<{ side: PositionSide }>`
${BoldTableText}
  color: ${(props) =>
		props.side === PositionSide.LONG ? props.theme.colors.green : props.theme.colors.red};
  margin-left: 4px;
	text-transform: uppercase;
`;

const Fee = styled.div`
	${BoldTableText};
`;

const StatusText = styled.div`
	${BoldTableText};
	margin-left: 4px;
`;

const StatusPendingIcon = styled(PendingIcon)`
	color: ${(props) => props.theme.colors.yellow};
`;

const StatusSuccessIcon = styled(SuccessIcon)`
	color: ${(props) => props.theme.colors.green};
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.elderberry};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

const CancelButton = styled(Button)`
	height: 24px;
	line-height: 24px;
`;
