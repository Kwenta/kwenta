import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { CellProps } from 'react-table';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import Wei, { wei } from '@synthetixio/wei';
import { Contract } from 'ethers';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';

import Card from 'components/Card';
import Table from 'components/Table';
import Button from 'components/Button';
import Etherscan from 'containers/Etherscan';
import { ExternalLink, FlexDivCentered, GridDivCenteredRow } from 'styles/common';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import LinkIcon from 'assets/svg/app/link.svg';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { NO_VALUE } from 'constants/placeholder';
import { Order, OrderStatus, PositionSide } from '../types';
import { Synths } from 'constants/currency';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { gasSpeedState } from 'store/wallet';

import PendingIcon from 'assets/svg/app/circle-ellipsis.svg';
import FailureIcon from 'assets/svg/app/circle-error.svg';
import SuccessIcon from 'assets/svg/app/circle-tick.svg';
import { getFuturesMarketContract } from 'queries/futures/utils';
import { formatCurrency, formatCryptoCurrency, zeroBN } from 'utils/formatters/number';
import { FuturesPosition } from 'queries/futures/types';
import { formatNumber } from 'utils/formatters/number';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { gasPriceInWei } from 'utils/network';

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
	const { etherscanInstance } = Etherscan.useContainer();
	const { synthetixjs } = Connector.useContainer();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const gasSpeed = useRecoilValue(gasSpeedState);
	console.log('PPPP', position);

	const ethGasPriceQuery = useEthGasPriceQuery(true);
	const gasPrice = ethGasPriceQuery?.data?.[gasSpeed] ?? null;

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
			return <StatusIcon status={OrderStatus.PENDING} src={PendingIcon} />;
		} else {
			return <StatusIcon status={OrderStatus.CONFIRMED} src={SuccessIcon} />;
		}
	};

	const handleCancelOrder = async () => {
		if (!gasPrice) return;
		try {
			const FuturesMarketContract: Contract = getFuturesMarketContract(
				currencyKey,
				synthetixjs!.contracts
			);
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
					// {
					// 	id: 'link',
					// 	Cell: (cellProps: CellProps<Order>) =>
					// 		etherscanInstance != null && cellProps.row.original.txHash ? (
					// 			<StyledExternalLink href={etherscanInstance.txLink(cellProps.row.original.txHash)}>
					// 				<StyledLinkIcon
					// 					src={LinkIcon}
					// 					viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`}
					// 				/>
					// 			</StyledExternalLink>
					// 		) : (
					// 			NO_VALUE
					// 		),
					// 	sortable: false,
					// 	width: 50,
					// },
				]}
				data={orders}
				columnsDeps={columnsDeps}
				isLoading={isLoading && !isLoaded}
				noResultsMessage={
					isLoaded && orders.length === 0 ? (
						<TableNoResults>
							<Svg src={NoNotificationIcon} />
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
	color: ${(props) => props.theme.colors.white};
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

const StyledId = styled.div`
	${BoldTableText}
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

const StatusIcon = styled(Svg)<{ status: OrderStatus }>`
	color: ${(props) =>
		props.status === OrderStatus.PENDING
			? props.theme.colors.yellow
			: props.status === OrderStatus.CONFIRMED
			? props.theme.colors.green
			: props.theme.colors.red};
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.elderberry};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

const StyledExternalLink = styled(ExternalLink)`
	margin-left: auto;
`;

const StyledLinkIcon = styled(Svg)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
`;

const CancelButton = styled(Button)`
	height: 24px;
	line-height: 24px;
`;
