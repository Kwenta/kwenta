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
import { Trade, TradeStatus, PositionSide } from '../types';
import { SYNTHS_MAP } from 'constants/currency';
import CurrencyIcon from 'components/Currency/CurrencyIcon';

import PendingIcon from 'assets/svg/app/circle-ellipsis.svg';
import FailureIcon from 'assets/svg/app/circle-error.svg';
import SuccessIcon from 'assets/svg/app/circle-tick.svg';
import { formatCurrency } from 'utils/formatters/number';

type TradesProps = {};

const Trades: React.FC<TradesProps> = ({}) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const Trades = [
		{
			id: '1',
			position: {
				side: PositionSide.LONG,
				amount: 1000,
				currency: SYNTHS_MAP.sBTC,
			},
			leverage: {
				amount: 5,
				side: PositionSide.LONG,
			},
			entryPrice: 1000,
			finalPrice: 2000,
			pnl: 100,
			status: TradeStatus.OPEN,
			txHash: '123',
		},
		{
			id: '2',
			position: {
				side: PositionSide.SHORT,
				amount: 1000,
				currency: SYNTHS_MAP.sBTC,
			},
			leverage: {
				amount: 5,
				side: PositionSide.SHORT,
			},
			entryPrice: 1000,
			finalPrice: 2000,
			pnl: -100,
			status: TradeStatus.LIQUIDATED,
			txHash: '123',
		},
		{
			id: '3',
			position: {
				side: PositionSide.LONG,
				amount: 1000,
				currency: SYNTHS_MAP.sBTC,
			},
			leverage: {
				amount: 5,
				side: PositionSide.LONG,
			},
			entryPrice: 1000,
			finalPrice: 2000,
			pnl: 200,
			status: TradeStatus.CLOSED,
			txHash: '123',
		},
	] as Trade[];

	const isLoading = false;
	const isLoaded = true;

	const columnsDeps = useMemo(() => [Trades], [Trades]);

	const returnStatusSVG = (status: TradeStatus) => {
		switch (status) {
			case TradeStatus.OPEN:
				return <StatusIcon status={status} src={PendingIcon} />;
			case TradeStatus.CLOSED:
				return <StatusIcon status={status} src={SuccessIcon} />;
			case TradeStatus.LIQUIDATED:
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
							<StyledTableHeader>{t('futures.market.user.trades.table.id')}</StyledTableHeader>
						),
						accessor: 'id',
						Cell: (cellProps: CellProps<Trade>) => <StyledId>{cellProps.row.original.id}</StyledId>,
						sortable: true,
						width: 100,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.trades.table.position')}
							</StyledTableHeader>
						),
						accessor: 'position',
						sortType: 'basic',
						Cell: (cellProps: CellProps<Trade>) => (
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
								{t('futures.market.user.trades.table.leverage')}
							</StyledTableHeader>
						),
						accessor: 'leverage',
						sortType: 'basic',
						Cell: (cellProps: CellProps<Trade>) => (
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
							<StyledTableHeader>{t('futures.market.user.trades.table.entry')}</StyledTableHeader>
						),
						accessor: 'entryPrice',
						sortType: 'basic',
						Cell: (cellProps: CellProps<Trade>) => (
							<Price>
								{formatCurrency(SYNTHS_MAP.sUSD, cellProps.row.original.entryPrice, {
									sign: '$',
								})}{' '}
								{selectedPriceCurrency.asset}
							</Price>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.final')}</StyledTableHeader>
						),
						accessor: 'finalPrice',
						sortType: 'basic',
						Cell: (cellProps: CellProps<Trade>) => (
							<Price>
								{formatCurrency(SYNTHS_MAP.sUSD, cellProps.row.original.finalPrice, {
									sign: '$',
								})}{' '}
								{selectedPriceCurrency.asset}
							</Price>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.pnl')}</StyledTableHeader>
						),
						accessor: 'pnl]',
						sortType: 'basic',
						Cell: (cellProps: CellProps<Trade>) => (
							<PNL negative={cellProps.row.original.pnl < 0}>
								{formatCurrency(SYNTHS_MAP.sUSD, cellProps.row.original.pnl, {
									sign: '$',
								})}{' '}
								{selectedPriceCurrency.asset}
							</PNL>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.status')}</StyledTableHeader>
						),
						accessor: 'status',
						sortType: 'basic',
						Cell: (cellProps: CellProps<Trade>) => (
							<FlexDivCentered>
								{returnStatusSVG(cellProps.row.original.status)}
								<StatusText>{cellProps.row.original.status}</StatusText>
							</FlexDivCentered>
						),
						width: 100,
						sortable: true,
					},
					{
						id: 'link',
						Cell: (cellProps: CellProps<Trade>) =>
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
				data={Trades}
				isLoading={isLoading && !isLoaded}
				noResultsMessage={
					isLoaded && Trades.length === 0 ? (
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
export default Trades;

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

const Price = styled.div`
	${BoldTableText};
`;

const PNL = styled.div<{ negative: boolean }>`
	${BoldTableText};
	color: ${(props) => (props.negative ? props.theme.colors.red : props.theme.colors.white)};
`;

const StatusText = styled.div`
	${BoldTableText};
	margin-left: 4px;
`;

const StatusIcon = styled(Svg)<{ status: TradeStatus }>`
	color: ${(props) =>
		props.status === TradeStatus.OPEN
			? props.theme.colors.yellow
			: props.status === TradeStatus.CLOSED
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
