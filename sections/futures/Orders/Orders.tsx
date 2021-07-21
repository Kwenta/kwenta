import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { CellProps } from 'react-table';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

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

import PendingIcon from 'assets/svg/app/circle-ellipsis.svg';
import FailureIcon from 'assets/svg/app/circle-error.svg';
import SuccessIcon from 'assets/svg/app/circle-tick.svg';
import { formatCurrency } from 'utils/formatters/number';

type OrdersProps = {};

const Orders: React.FC<OrdersProps> = ({}) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const orders = [
		{
			id: '1',
			position: {
				side: PositionSide.LONG,
				amount: 1000,
				currency: Synths.sBTC,
			},
			leverage: {
				amount: 5,
				side: PositionSide.LONG,
			},
			fee: 100,
			status: OrderStatus.PENDING,
			txHash: '123',
		},
	] as Order[];

	const isLoading = false;
	const isLoaded = true;

	const columnsDeps = useMemo(() => [orders], [orders]);

	const returnStatusSVG = (status: OrderStatus) => {
		switch (status) {
			case OrderStatus.PENDING:
				return <StatusIcon status={status} src={PendingIcon} />;
			case OrderStatus.CONFIRMED:
				return <StatusIcon status={status} src={SuccessIcon} />;
			case OrderStatus.FAILED:
				return <StatusIcon status={status} src={FailureIcon} />;
		}
	};

	return (
		<Card>
			<StyledTable
				palette="primary"
				columns={[
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.orders.table.id')}</StyledTableHeader>
						),
						accessor: 'id',
						Cell: (cellProps: CellProps<Order>) => <StyledId>{cellProps.row.original.id}</StyledId>,
						sortable: true,
						width: 100,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.orders.table.position')}
							</StyledTableHeader>
						),
						accessor: 'position',
						sortType: 'basic',
						Cell: (cellProps: CellProps<Order>) => (
							<FlexDivCentered>
								<CurrencyIcon currencyKey={cellProps.row.original.position.currency} />
								<StyledPositionSize>
									{cellProps.row.original.position.amount}{' '}
									{cellProps.row.original.position.currency}
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
						Cell: (cellProps: CellProps<Order>) => (
							<FlexDivCentered>
								<LeverageSize>{cellProps.row.original.leverage.amount}x |</LeverageSize>
								<LeverageSide side={cellProps.row.original.leverage.side}>
									{cellProps.row.original.leverage.side}
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
						Cell: (cellProps: CellProps<Order>) => (
							<Fee>
								{formatCurrency(Synths.sUSD, cellProps.row.original.fee, {
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
						accessor: 'status',
						sortType: 'basic',
						Cell: (cellProps: CellProps<Order>) => (
							<FlexDivCentered>
								{returnStatusSVG(cellProps.row.original.status)}
								<StatusText>{cellProps.row.original.status}</StatusText>
							</FlexDivCentered>
						),
						width: 100,
						sortable: true,
					},
					{
						id: 'cancel',
						Cell: () => (
							<Button onClick={() => {}} isRounded variant="danger" size="md">
								{t('futures.market.user.orders.table.cancel')}
							</Button>
						),
						sortable: false,
						width: 50,
					},
					{
						id: 'link',
						Cell: (cellProps: CellProps<Order>) =>
							etherscanInstance != null && cellProps.row.original.txHash ? (
								<StyledExternalLink href={etherscanInstance.txLink(cellProps.row.original.txHash)}>
									<StyledLinkIcon
										src={LinkIcon}
										viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`}
									/>
								</StyledExternalLink>
							) : (
								NO_VALUE
							),
						sortable: false,
						width: 50,
					},
				]}
				columnsDeps={columnsDeps}
				data={orders}
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
