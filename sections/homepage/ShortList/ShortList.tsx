import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { CellProps } from 'react-table';
import Wei, { wei } from '@synthetixio/wei';
import { Synths } from '@synthetixio/contracts-interface';

import GridSvg from 'assets/svg/app/grid.svg';
import Table from 'components/Table';
import Currency from 'components/Currency';
import Loader from 'components/Loader';
import ROUTES from 'constants/routes';
import useENS from 'hooks/useENS';
import useGetStats from 'queries/futures/useGetStats';
import { FuturesStat } from 'queries/futures/types';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesDailyTradeStats from 'queries/futures/useGetFuturesDailyTradeStats';
import { FlexDivColCentered, FlexDivRow, SmallGoldenHeader, WhiteHeader } from 'styles/common';
import { Media } from 'styles/media';
import { formatCurrency, formatNumber, zeroBN } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import { Copy, Title } from '../common';

type Stat = {
	pnl: Wei;
	liquidations: Wei;
	totalTrades: Wei;
	totalVolume: Wei;
};

const ShortList = () => {
	const { t } = useTranslation();

	const statsQuery = useGetStats();
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
			<SectionFeatureCopy>{t('homepage.shortlist.stats.copy')}</SectionFeatureCopy>
		</>
	);

	const dailyTradeStats = useGetFuturesDailyTradeStats();

	const futuresMarketsQuery = useGetFuturesMarkets();
	const openInterest = useMemo(() => {
		const futuresMarkets = futuresMarketsQuery?.data ?? [];
		return futuresMarkets
			.map((market) => market.marketSize.mul(market.price).toNumber())
			.reduce((total, openInterest) => total + openInterest, 0);
	}, [futuresMarketsQuery?.data]);

	return (
		<Container>
			<Media greaterThanOrEqual="lg">
				<FlexDivColCentered>{title}</FlexDivColCentered>
			</Media>
			<StyledTable
				showPagination={true}
				isLoading={statsQuery.isLoading}
				showShortList={true}
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
						Header: <TableHeader>{t('leaderboard.leaderboard.table.total-trades')}</TableHeader>,
						accessor: 'totalTrades',
						Cell: (cellProps: CellProps<any>) => (
							<DefaultCell>{cellProps.row.original.totalTrades}</DefaultCell>
						),
						width: 100,
					},
					{
						Header: <TableHeader>{t('leaderboard.leaderboard.table.liquidations')}</TableHeader>,
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
								currencyKey={Synths.sUSD}
								price={cellProps.row.original.pnl}
								sign={'$'}
								conversionRate={1}
							/>
						),
						width: 125,
					},
				]}
			/>
			<FlexDivColCentered>{sectionTitle}</FlexDivColCentered>
			<StatsCardContainer>
				<StatsCard>
					<StatsName>{t('homepage.shortlist.stats.volume')}</StatsName>
					<StatsValue>
						{dailyTradeStats.isLoading ? (
							<Loader />
						) : (
							formatCurrency(Synths.sUSD, dailyTradeStats.data?.totalVolume || zeroBN, {
								sign: '$',
								minDecimals: 0,
							})
						)}
					</StatsValue>
					<GridSvg />
				</StatsCard>
				<StatsCard>
					<StatsName>{t('homepage.shortlist.stats.open-interest')}</StatsName>
					<StatsValue>
						{futuresMarketsQuery.isLoading ? (
							<Loader />
						) : (
							formatCurrency(Synths.sUSD, openInterest ?? 0, {
								sign: '$',
								minDecimals: 0,
							})
						)}
					</StatsValue>
					<GridSvg />
				</StatsCard>
				<StatsCard>
					<StatsName>{t('homepage.shortlist.stats.trades')}</StatsName>
					<StatsValue>
						{dailyTradeStats.isLoading ? (
							<Loader />
						) : (
							formatNumber(dailyTradeStats.data?.totalTrades ?? 0, { minDecimals: 0 })
						)}
					</StatsValue>
					<GridSvg />
				</StatsCard>
			</StatsCardContainer>
		</Container>
	);
};

const StatsName = styled.div`
	font-size: 15px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const StatsValue = styled.div`
	font-size: 32px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	margin-top: 14px;
`;

const StatsCardContainer = styled(FlexDivRow)`
	margin-top: 40px;
	justify-content: center;
	column-gap: 20px;
`;

const StatsCard = styled(FlexDivColCentered)`
	width: 308px;
	height: 191px;
	background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 15px;
	padding: 45px;
	padding-bottom: 0px;
	justify-conent: flex-end;
	svg {
		width: 307px;
		height: 79px;
	}
`;

const StyledTable = styled(Table)`
	margin-top: 60px;
	font-size: 15px;
	width: 1160px;
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
	margin-bottom: 140px;
	justify-content: center;
`;

const TableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 13px;
`;

export const Bullet = styled.span`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background: ${(props) => props.theme.colors.gold};
`;

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.white};
	text-align: center;
	width: 40px;
`;

const StyledTrader = styled.a`
	color: ${(props) => props.theme.colors.white};
	display: flex;
	font-size: 15px;
`;

const FeatureCopy = styled(Copy)`
	font-size: 15px;
	line-height: 150%;
	letter-spacing: -0.03em;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	width: 183px;
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
`;

const SectionFeatureCopy = styled(FeatureCopy)`
	margin-top: 16px;
	text-align: center;
	width: 500px;
	font-size: 18px;
`;

export default ShortList;
