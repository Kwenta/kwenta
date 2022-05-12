import Table from 'components/Table';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { Synths } from 'constants/currency';
import useGetFuturesAccountPositionHistory from 'queries/futures/useGetFuturesAccountPositionHistory';
import { PositionHistory } from 'queries/futures/types';
import Loader from 'components/Loader';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { FlexDiv } from 'styles/common';
import router from 'next/router';
import ROUTES from 'constants/routes';
import TimeDisplay from 'sections/futures/Trades/TimeDisplay';

type TraderHistoryProps = {
	trader: string;
	traderENSName: string | null;
	resetSelection: Function;
	compact?: boolean;
	searchTerm?: string | undefined;
};

const TraderHistory: FC<TraderHistoryProps> = ({
	trader,
	traderENSName,
	resetSelection,
	compact,
	searchTerm,
}: TraderHistoryProps) => {
	const { t } = useTranslation();
	const positionsQuery = useGetFuturesAccountPositionHistory(trader);
	const positions = useMemo(() => positionsQuery.data ?? [], [positionsQuery]);

	let data = useMemo(() => {
		return positions
			.sort((a: PositionHistory, b: PositionHistory) => b.timestamp - a.timestamp)
			.map((stat: PositionHistory, i: number) => ({
				rank: i + 1,
				currencyIconKey: stat.asset ? (stat.asset[0] !== 's' ? 's' : '') + stat.asset : '',
				marketShortName: (stat.asset[0] === 's' ? stat.asset.slice(1) : stat.asset) + '-PERP',
				openTimestamp: stat.openTimestamp,
				asset: stat.asset,
				status: stat.isOpen ? 'Open' : stat.isLiquidated ? 'Liquidated' : 'Closed',
				feesPaid: stat.feesPaid,
				netFunding: stat.netFunding,
				pnl: stat.pnl.sub(stat.feesPaid).add(stat.netFunding),
				totalVolume: stat.totalVolume,
				trades: stat.trades,
				side: stat.side,
			}))
			.filter((i: { marketShortName: string; status: string }) =>
				searchTerm?.length
					? i.marketShortName.toLowerCase().includes(searchTerm) ||
					  i.status.toLowerCase().includes(searchTerm)
					: true
			);
	}, [positions, searchTerm]);

	if (positionsQuery.isLoading) {
		return <Loader />;
	}

	return (
		<StyledTable
			compact={compact}
			showPagination={true}
			pageSize={10}
			isLoading={false}
			data={data}
			hideHeaders={compact}
			columns={[
				{
					Header: (
						<TableTitle>
							<TitleText
								onClick={() => {
									resetSelection();
									router.push(ROUTES.Leaderboard.Home);
								}}
							>
								{t('leaderboard.leaderboard.table.title')}
							</TitleText>
							<TitleSeparator>&gt;</TitleSeparator>
							<TraderText
								href={`https://optimistic.etherscan.io/address/${trader}`}
								target="_blank"
								rel="noreferrer noopener"
							>
								{traderENSName ?? trader}
							</TraderText>
						</TableTitle>
					),
					accessor: 'title',
					columns: [
						{
							Header: <TableHeader>{t('leaderboard.trader-history.table.timestamp')}</TableHeader>,
							accessor: 'openTimestamp',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<StyledCell>
										<TimeDisplay cellPropsValue={cellProps.row.original.openTimestamp} />
									</StyledCell>
								);
							},
							sortType: 'basic',
							sortable: true,
							width: compact ? 40 : 100,
						},
						{
							Header: <TableHeader>{t('leaderboard.trader-history.table.market')}</TableHeader>,
							accessor: 'asset',
							Cell: (cellProps: CellProps<any>) => (
								<CurrencyInfo>
									<StyledCurrencyIcon currencyKey={cellProps.row.original.currencyIconKey} />
									<StyledSubtitle>{cellProps.row.original.marketShortName}</StyledSubtitle>
								</CurrencyInfo>
							),
							width: compact ? 40 : 100,
						},
						{
							Header: <TableHeader>{t('leaderboard.trader-history.table.status')}</TableHeader>,
							accessor: 'status',
							Cell: (cellProps: CellProps<any>) => {
								return <StyledCell>{cellProps.row.original.status}</StyledCell>;
							},
							width: compact ? 40 : 100,
						},
						{
							Header: (
								<TableHeader>{t('leaderboard.trader-history.table.total-trades')}</TableHeader>
							),
							accessor: 'trades',
							width: compact ? 40 : 100,
							sortType: 'basic',
							sortable: true,
						},
						{
							Header: (
								<TableHeader>{t('leaderboard.trader-history.table.total-volume')}</TableHeader>
							),
							accessor: 'totalVolume',
							Cell: (cellProps: CellProps<any>) => (
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.totalVolume}
									sign={'$'}
									conversionRate={1}
								/>
							),
							width: compact ? 40 : 100,
							sortType: 'basic',
							sortable: true,
						},
						{
							Header: <TableHeader>{t('leaderboard.trader-history.table.total-pnl')}</TableHeader>,
							accessor: 'pnl',
							Cell: (cellProps: CellProps<any>) => (
								<ColorCodedPrice
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.pnl}
									sign={'$'}
									conversionRate={1}
								/>
							),
							width: compact ? 40 : 100,
							sortType: 'basic',
							sortable: true,
						},
					],
				},
			]}
		/>
	);
};

const StyledTable = styled(Table)<{ compact: boolean | undefined }>`
	margin-top: ${({ compact }) => (compact ? '0' : '15px')};
`;

const TableTitle = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-start;
`;

const TitleText = styled.a`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.secondaryGray};

	&:hover {
		text-decoration: underline;
		cursor: pointer;
	}
`;

const StyledCell = styled.div`
	color: ${(props) => props.theme.colors.white};
	display: flex;
`;

const TitleSeparator = styled.div`
	margin-left: 10px;
	margin-right: 10px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const TraderText = styled.a`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.primaryWhite};

	&:hover {
		text-decoration: underline;
	}
`;

const TableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	width: 30px;
	height: 30px;
	margin-right: 5px;
`;

const CurrencyInfo = styled(FlexDiv)`
	align-items: center;
`;

const StyledSubtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	text-transform: capitalize;
`;

const ColorCodedPrice = styled(Currency.Price)`
	align-items: right;
	color: ${(props) =>
		props.price > 0
			? props.theme.colors.green
			: props.price < 0
			? props.theme.colors.red
			: props.theme.colors.white};
`;

export default TraderHistory;
