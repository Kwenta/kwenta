import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { CellProps } from 'react-table';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import { wei } from '@synthetixio/wei';

import Card from 'components/Card';
import Table from 'components/Table';
import BlockExplorer from 'containers/BlockExplorer';
import { ExternalLink, FlexDivCentered, GridDivCenteredRow } from 'styles/common';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import LinkIcon from 'assets/svg/app/link.svg';
import { TradeStatus, PositionSide } from '../types';
import { Synths } from 'constants/currency';
import CurrencyIcon from 'components/Currency/CurrencyIcon';

import PendingIcon from 'assets/svg/app/circle-ellipsis.svg';
import FailureIcon from 'assets/svg/app/circle-error.svg';
import SuccessIcon from 'assets/svg/app/circle-tick.svg';
import { formatCurrency, formatCryptoCurrency, formatNumber } from 'utils/formatters/number';
import { PositionHistory } from 'queries/futures/types';

type TradesProps = {
	history: PositionHistory[] | null;
	isLoading: boolean;
	isLoaded: boolean;
};

const Trades: React.FC<TradesProps> = ({ history, isLoading, isLoaded }) => {
	const { t } = useTranslation();
	const { blockExplorerInstance } = BlockExplorer.useContainer();

	const columnsDeps = useMemo(() => [history], [history]);

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
						Cell: (cellProps: CellProps<PositionHistory>) => <StyledId>{cellProps.value}</StyledId>,
						sortable: true,
						width: 50,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.trades.table.position')}
							</StyledTableHeader>
						),
						accessor: 'size',
						sortType: 'basic',
						Cell: (cellProps: CellProps<PositionHistory>) => (
							<FlexDivCentered>
								<CurrencyIcon currencyKey={cellProps.row.original.asset} />
								<StyledPositionSize>
									{formatCryptoCurrency(cellProps.value, {
										currencyKey: cellProps.row.original.asset,
									})}
								</StyledPositionSize>
							</FlexDivCentered>
						),
						width: 100,
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
						Cell: (cellProps: CellProps<PositionHistory>) => (
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
							<StyledTableHeader>{t('futures.market.user.trades.table.entry')}</StyledTableHeader>
						),
						accessor: 'entryPrice',
						sortType: 'basic',
						Cell: (cellProps: CellProps<PositionHistory>) => (
							<Price>
								{formatCurrency(Synths.sUSD, cellProps.value, {
									sign: '$',
								})}
							</Price>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.final')}</StyledTableHeader>
						),
						accessor: 'exitPrice',
						sortType: 'basic',
						Cell: (cellProps: CellProps<PositionHistory>) => (
							<Price>
								{cellProps.row.original.isOpen
									? '--'
									: formatCurrency(Synths.sUSD, cellProps.value, {
											sign: '$',
									  })}
							</Price>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.pnl')}</StyledTableHeader>
						),
						accessor: 'pnl',
						sortType: 'basic',
						Cell: (cellProps: CellProps<PositionHistory>) => (
							<PNL
								negative={cellProps.row.original.exitPrice.gt(wei(0)) && cellProps.value.lt(wei(0))}
							>
								{cellProps.row.original.exitPrice.gt(wei(0))
									? formatCurrency(Synths.sUSD, cellProps.value, {
											sign: '$',
									  })
									: '--'}
							</PNL>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.status')}</StyledTableHeader>
						),
						id: 'status',
						sortType: 'basic',
						Cell: (cellProps: CellProps<PositionHistory>) => {
							const { isOpen, isLiquidated } = cellProps.row.original;
							const status = isLiquidated
								? TradeStatus.LIQUIDATED
								: isOpen
								? TradeStatus.OPEN
								: TradeStatus.CLOSED;
							return (
								<FlexDivCentered>
									{returnStatusSVG(status)}
									<StatusText>{status}</StatusText>
								</FlexDivCentered>
							);
						},
						width: 100,
						sortable: true,
					},
					{
						accessor: 'transactionHash',
						Cell: (cellProps: CellProps<PositionHistory>) => (
							<StyledExternalLink href={blockExplorerInstance?.txLink(cellProps.value)}>
								<StyledLinkIcon
									src={LinkIcon}
									viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`}
								/>
							</StyledExternalLink>
						),
						sortable: false,
						width: 50,
					},
				]}
				columnsDeps={columnsDeps}
				data={history || []}
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
