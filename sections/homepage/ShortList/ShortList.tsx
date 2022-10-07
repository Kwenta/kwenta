import Wei, { wei } from '@synthetixio/wei';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import GridSvg from 'assets/svg/app/grid.svg';
import Button from 'components/Button';
import Currency from 'components/Currency';
import Loader from 'components/Loader';
import Table from 'components/Table';
import ROUTES from 'constants/routes';
import useENS from 'hooks/useENS';
import { FuturesStat } from 'queries/futures/types';
import useGetFuturesCumulativeStats from 'queries/futures/useGetFuturesCumulativeStats';
import useGetStats from 'queries/futures/useGetStats';
import { FlexDivColCentered, FlexDivRow, SmallGoldenHeader, WhiteHeader } from 'styles/common';
import media, { Media } from 'styles/media';
import { formatDollars, formatNumber, zeroBN } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';

import { StackSection, Title } from '../common';

type Stat = {
	pnl: Wei;
	liquidations: Wei;
	totalTrades: Wei;
	totalVolume: Wei;
};

const ShortList = () => {
	const { t } = useTranslation();

	const statsQuery = useGetStats(true);
	const stats = useMemo(() => statsQuery.data ?? [], [statsQuery]);
	const pnlMap = useMemo(
		() =>
			stats.reduce((acc: Record<string, Stat>, stat: FuturesStat) => {
				acc[stat.account] = {
					pnl: wei(stat.pnlWithFeesPaid ?? 0, 18, true),
					liquidations: new Wei(stat.liquidations ?? 0),
					totalTrades: new Wei(stat.totalTrades ?? 0),
					totalVolume: wei(stat.totalVolume ?? 0, 18, true),
				};
				return acc;
			}, {}),
		[stats]
	);

	const router = useRouter();
	const onClickTrader = (trader: string) => {
		router.push(ROUTES.Leaderboard.Trader(trader));
	};

	const getMedal = (position: number) => {
		switch (position) {
			case 1:
				return <Medal>🥇</Medal>;
			case 2:
				return <Medal>🥈</Medal>;
			case 3:
				return <Medal>🥉</Medal>;
			default:
				return <Medal> {position} </Medal>;
		}
	};

	let data = useMemo(
		() =>
			stats
				.sort(
					(a: FuturesStat, b: FuturesStat) =>
						(pnlMap[b.account]?.pnl || 0) - (pnlMap[a.account]?.pnl || 0)
				)
				.map((stat: FuturesStat, i: number) => ({
					rank: i + 1,
					trader: stat.account,
					traderShort: truncateAddress(stat.account),
					totalTrades: (pnlMap[stat.account]?.totalTrades ?? wei(0)).toNumber(),
					totalVolume: (pnlMap[stat.account]?.totalVolume ?? wei(0)).toNumber(),
					liquidations: (pnlMap[stat.account]?.liquidations ?? wei(0)).toNumber(),
					'24h': 80000,
					pnl: (pnlMap[stat.account]?.pnl ?? wei(0)).toNumber(),
				})),
		[stats, pnlMap]
	);

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.shortlist.title')}</SmallGoldenHeader>
			<WhiteHeader>{t('homepage.shortlist.description')}</WhiteHeader>
		</>
	);

	const sectionTitle = (
		<>
			<SectionFeatureTitle>{t('homepage.shortlist.stats.title')}</SectionFeatureTitle>
		</>
	);

	const totalTradeStats = useGetFuturesCumulativeStats();

	return (
		<StackSection>
			<Container>
				<FlexDivColCentered>{title}</FlexDivColCentered>
				<Media greaterThan="sm">
					<StyledTable
						showPagination
						isLoading={statsQuery.isLoading}
						showShortList
						onTableRowClick={(row) => onClickTrader(row.original.trader)}
						data={data}
						pageSize={5}
						hideHeaders={false}
						columns={[
							{
								Header: <TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>,
								accessor: 'rank',
								Cell: (cellProps: CellProps<any>) => (
									<StyledOrderType>{getMedal(cellProps.row.original.rank)}</StyledOrderType>
								),
								width: 65,
							},
							{
								Header: <TableHeader>{t('leaderboard.leaderboard.table.trader')}</TableHeader>,
								accessor: 'trader',
								Cell: (cellProps: CellProps<any>) => {
									const { ensName, ensAvatar } = useENS(cellProps.row.original.trader);
									return (
										<StyledTrader>
											{ensName ? (
												<>
													{ensAvatar && (
														<img
															src={ensAvatar}
															alt={ensName}
															width={16}
															height={16}
															style={{ borderRadius: '50%', marginRight: '8px' }}
														/>
													)}
													{ensName}
												</>
											) : (
												cellProps.row.original.traderShort
											)}
										</StyledTrader>
									);
								},
								width: 150,
							},
							{
								Header: (
									<TableHeader>{t('leaderboard.leaderboard.table.total-trades')}</TableHeader>
								),
								accessor: 'totalTrades',
								Cell: (cellProps: CellProps<any>) => (
									<DefaultCell>{cellProps.row.original.totalTrades}</DefaultCell>
								),
								width: 100,
							},
							{
								Header: (
									<TableHeader>{t('leaderboard.leaderboard.table.liquidations')}</TableHeader>
								),
								accessor: 'liquidations',
								Cell: (cellProps: CellProps<any>) => (
									<DefaultCell>{cellProps.row.original.liquidations}</DefaultCell>
								),
								width: 100,
							},
							{
								Header: <TableHeader>{t('leaderboard.leaderboard.table.total-pnl')}</TableHeader>,
								accessor: 'pnl',
								Cell: (cellProps: CellProps<any>) => (
									<ColorCodedPrice
										currencyKey={'sUSD'}
										price={cellProps.row.original.pnl}
										sign={'$'}
										conversionRate={1}
									/>
								),
								width: 125,
							},
						]}
					/>
				</Media>
				<Media lessThan="sm">
					<StyledTable
						showPagination
						isLoading={statsQuery.isLoading}
						showShortList
						onTableRowClick={(row) => onClickTrader(row.original.trader)}
						data={data}
						pageSize={5}
						hideHeaders={false}
						columns={[
							{
								Header: <TableHeader>{t('leaderboard.leaderboard.table.rank-mobile')}</TableHeader>,
								accessor: 'rank',
								Cell: (cellProps: CellProps<any>) => (
									<StyledOrderType>{getMedal(cellProps.row.original.rank)}</StyledOrderType>
								),
								width: 45,
							},
							{
								Header: <TableHeader>{t('leaderboard.leaderboard.table.trader')}</TableHeader>,
								accessor: 'trader',
								Cell: (cellProps: CellProps<any>) => {
									const { ensName, ensAvatar } = useENS(cellProps.row.original.trader);
									return (
										<StyledTrader>
											{ensName ? (
												<>
													{ensAvatar && (
														<img
															src={ensAvatar}
															alt={ensName}
															width={16}
															height={16}
															style={{ borderRadius: '50%', marginRight: '8px' }}
														/>
													)}
													{ensName}
												</>
											) : (
												cellProps.row.original.traderShort
											)}
										</StyledTrader>
									);
								},
								width: 150,
							},
							{
								Header: <TableHeader>{t('leaderboard.leaderboard.table.total-pnl')}</TableHeader>,
								accessor: 'pnl',
								Cell: (cellProps: CellProps<any>) => (
									<ColorCodedPrice
										currencyKey={'sUSD'}
										price={cellProps.row.original.pnl}
										sign={'$'}
										conversionRate={1}
									/>
								),
								width: 125,
							},
						]}
					/>
				</Media>
				<FlexDivColCentered>{sectionTitle}</FlexDivColCentered>
				<StatsCardContainer>
					<StatsCard>
						<StatsName>{t('homepage.shortlist.stats.volume')}</StatsName>
						<StatsValue>
							{totalTradeStats.isLoading ? (
								<Loader />
							) : (
								formatDollars(totalTradeStats.data?.totalVolume || zeroBN, {
									minDecimals: 0,
								})
							)}
						</StatsValue>
						<GridSvg />
					</StatsCard>
					<StatsCard>
						<StatsName>{t('homepage.shortlist.stats.traders')}</StatsName>
						<StatsValue>{statsQuery.isLoading ? <Loader /> : stats.length ?? 0}</StatsValue>
						<GridSvg />
					</StatsCard>
					<StatsCard>
						<StatsName>{t('homepage.shortlist.stats.trades')}</StatsName>
						<StatsValue>
							{totalTradeStats.isLoading ? (
								<Loader />
							) : (
								formatNumber(totalTradeStats.data?.totalTrades ?? 0, { minDecimals: 0 })
							)}
						</StatsValue>
						<GridSvg />
					</StatsCard>
				</StatsCardContainer>
			</Container>
		</StackSection>
	);
};

const StatsName = styled.div`
	font-size: 15px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const StatsValue = styled.div`
	font-size: 32px;
	color: ${(props) => props.theme.colors.selectedTheme.white};
	margin-top: 14px;
`;

const StatsCardContainer = styled(FlexDivRow)`
	margin-top: 40px;
	justify-content: center;
	column-gap: 20px;

	${media.lessThan('sm')`
		flex-direction: column;
		margin: auto;
		padding: 0px;
		row-gap: 15px;
		margin-top: 30px;
	`}
`;

const StatsCard = styled(Button)`
	disply: flex;
	flex-direction: column;
	align-items: center;
	width: 291px;
	height: 191px;
	font-family: ${(props) => props.theme.fonts.regular};
	border-radius: 15px;
	&::before {
		border-radius: 15px;
	}
	cursor: default;
	&:hover {
		background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
	}
	background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	padding: 45px;
	padding-bottom: 60px;
	justify-content: flex-end;
	svg {
		width: 291px;
		height: 75px;
		position: absolute;
		right: 0;
		top: 0;

		margin-top: 115px;
		z-index: 20;
		background-size: cover;
	}
`;

const StyledTable = styled(Table)`
	margin-top: 60px;
	font-size: 15px;
	width: 1160px;
	${media.lessThan('sm')`
		width: 345px;
		& > .table-body >.table-body-row >.table-body-cell {
			padding-left: 0px;
		}
	`}
`;

const Medal = styled.span`
	font-size: 15px;
`;

const DefaultCell = styled.p`
	font-size: 15px;
`;

const ColorCodedPrice = styled(Currency.Price)`
	align-items: right;
	color: ${(props) =>
		props.price > 0
			? props.theme.colors.green
			: props.price < 0
			? props.theme.colors.red
			: props.theme.colors.white};
	font-size: 15px;
`;

const Container = styled(FlexDivColCentered)`
	padding-bottom: 140px;
	justify-content: center;
	${media.greaterThan('sm')`
		background: radial-gradient(white, rgba(2, 225, 255, 0.15) 0px, transparent 280px),
			radial-gradient(white, rgba(201, 151, 90, 0.25) 0px, transparent 330px);
		background-size: 100% 200%, 100% 100%;
		background-position: -300px 0px, 250px 500px;
		background-repeat: no-repeat, no-repeat;
	`}
	${media.lessThan('sm')`
		padding-bottom: 100px;
		background: radial-gradient(white, rgba(2, 225, 255, 0.15) 0px, transparent 120px),
		radial-gradient(white, rgba(201, 151, 90, 0.2) 0px, transparent 180px);
		background-size: 100% 60%, 100% 60%;
		background-position: -120px 1000px, 80px 1000px;
		background-repeat: no-repeat, no-repeat;
		z-index: 20;
	`}
`;

const TableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 13px;
`;

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.white};
	text-align: center;
	width: 45px;
`;

const StyledTrader = styled.a`
	color: ${(props) => props.theme.colors.white};
	display: flex;
	font-size: 15px;
`;

const FeatureTitle = styled(Title)`
	font-size: 24px;
	line-height: 100%;
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.white};
	text-shadow: 0px 0px 12.83px rgba(255, 255, 255, 0.2);
	width: 150px;
`;

const SectionFeatureTitle = styled(FeatureTitle)`
	margin-top: 80px;
	text-align: center;
	width: 500px;
	${media.lessThan('sm')`
		width: 100vw;
	`}
`;

export default ShortList;
