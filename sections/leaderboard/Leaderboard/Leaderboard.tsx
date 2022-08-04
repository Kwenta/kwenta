import Wei, { wei } from '@synthetixio/wei';
import { useRouter } from 'next/router';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Table from 'components/Table';
import Search from 'components/Table/Search';
import { Synths } from 'constants/currency';
import { DEFAULT_LEADERBOARD_ROWS } from 'constants/defaults';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import useENSAvatar from 'hooks/useENSAvatar';
import useENSs from 'hooks/useENSs';
import { FuturesStat } from 'queries/futures/types';
import useGetStats from 'queries/futures/useGetStats';
import { walletAddressState } from 'store/wallet';
import { truncateAddress } from 'utils/formatters/string';

import Competition from '../Competition';
import TraderHistory from '../TraderHistory';

type LeaderboardProps = {
	compact?: boolean;
};

type Stat = {
	pnl: Wei;
	liquidations: Wei;
	totalTrades: Wei;
	totalVolume: Wei;
};

export const getMedal = (position: number) => {
	switch (position) {
		case 1:
			return <Medal>🥇</Medal>;
		case 2:
			return <Medal>🥈</Medal>;
		case 3:
			return <Medal>🥉</Medal>;
	}
};

const Leaderboard: FC<LeaderboardProps> = ({ compact }: LeaderboardProps) => {
	const { t } = useTranslation();
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [filterCompetition, setFilterCompetition] = useState<boolean>(true);
	const [selectedTrader, setSelectedTrader] = useState('');
	const [traderENSName, setTraderENSName] = useState<string | null>(null);
	const router = useRouter();
	const { staticMainnetProvider } = Connector.useContainer();

	const walletAddress = useRecoilValue(walletAddressState);

	const statsQuery = useGetStats();
	const stats = useMemo(() => statsQuery.data ?? [], [statsQuery]);

	const traders = useMemo(
		() =>
			stats.map((stat: FuturesStat) => {
				return stat.account;
			}) ?? [],
		[stats]
	);
	const ensInfoQuery = useENSs(traders);
	const ensInfo = useMemo(() => ensInfoQuery.data ?? [], [ensInfoQuery]);

	useMemo(() => {
		if (router.query.tab) {
			const trader = router.query.tab[0];
			setSelectedTrader(trader);
		} else {
			setSearchTerm('');
			setSelectedTrader('');
		}
		return null;
	}, [router.query]);

	const pnlMap = stats.reduce((acc: Record<string, Stat>, stat: FuturesStat) => {
		acc[stat.account] = {
			pnl: wei(stat.pnlWithFeesPaid ?? 0, 18, true),
			liquidations: new Wei(stat.liquidations ?? 0),
			totalTrades: new Wei(stat.totalTrades ?? 0),
			totalVolume: wei(stat.totalVolume ?? 0, 18, true),
		};
		return acc;
	}, {});

	const onChangeSearch = (text: string) => {
		setSearchTerm(text?.toLowerCase());
	};

	let data = useMemo(() => {
		return stats
			.map((stat: FuturesStat, i: number) => ({
				address: stat.account,
				trader: stat.account,
				traderShort: truncateAddress(stat.account),
				traderEns: ensInfo[i]
					? ensInfo[i].endsWith('.eth')
						? ensInfo[i]
						: truncateAddress(ensInfo[i])
					: null,
				totalTrades: (pnlMap[stat.account]?.totalTrades ?? wei(0)).toNumber(),
				totalVolume: (pnlMap[stat.account]?.totalVolume ?? wei(0)).toNumber(),
				liquidations: (pnlMap[stat.account]?.liquidations ?? wei(0)).toNumber(),
				'24h': 80000,
				pnl: (pnlMap[stat.account]?.pnl ?? wei(0)).toNumber(),
			}))
			.filter((stat: FuturesStat) => stat.totalVolume > 0)
			.sort((a: FuturesStat, b: FuturesStat) => (b?.pnl || 0) - (a?.pnl || 0))
			.map((stat: FuturesStat, i: number) => ({
				rank: i + 1,
				...stat,
			}))
			.filter((i: { trader: string; traderEns: string }) =>
				searchTerm?.length
					? i.trader.toLowerCase().includes(searchTerm) ||
					  i.traderEns?.toLowerCase().includes(searchTerm)
					: true
			);
	}, [stats, searchTerm, pnlMap, ensInfo]);

	if (compact) {
		const ownPosition = data.findIndex((i: { address: string }) => {
			return i.address.toLowerCase() === walletAddress?.toLowerCase();
		});

		const anchorPosition = ownPosition !== -1 && ownPosition > 10 ? data[ownPosition] : null;

		data = data.slice(0, 10);

		if (anchorPosition) {
			data.push(anchorPosition);
		}
	}

	const onClickTrader = (trader: string, ensName: string | null) => {
		setSearchTerm('');
		setSelectedTrader(trader);
		setTraderENSName(ensName);
		router.push(ROUTES.Leaderboard.Trader(trader));
	};

	return (
		<>
			<SearchContainer>
				<Search value={searchTerm} onChange={onChangeSearch} disabled={false} />
			</SearchContainer>
			<TableContainer compact={compact}>
				{filterCompetition ? (
					<Competition
						resetSelection={() => setSelectedTrader('')}
						compact={compact}
						searchTerm={searchTerm}
					/>
				) : selectedTrader !== '' ? (
					<TraderHistory
						trader={selectedTrader}
						traderENSName={traderENSName}
						resetSelection={() => setSelectedTrader('')}
						compact={compact}
						searchTerm={searchTerm}
					/>
				) : (
					<>
						<MobileHiddenView>
							<StyledTable
								compact={compact}
								showPagination
								isLoading={statsQuery.isLoading || ensInfoQuery.isLoading}
								data={data}
								pageSize={20}
								hideHeaders={compact}
								hiddenColumns={
									compact
										? ['rank', 'totalTrades', 'liquidations', 'totalVolume', 'pnl']
										: undefined
								}
								columns={[
									{
										Header: (
											<TableTitle>
												<TitleText>{t('leaderboard.leaderboard.table.title')}</TitleText>
											</TableTitle>
										),
										accessor: 'title',
										columns: [
											{
												Header: (
													<TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>
												),
												accessor: 'rank',
												Cell: (cellProps: CellProps<any>) => (
													<StyledOrderType>{cellProps.row.original.rank}</StyledOrderType>
												),
												width: compact ? 40 : 100,
											},
											{
												Header: !compact ? (
													<TableHeader>{t('leaderboard.leaderboard.table.trader')}</TableHeader>
												) : (
													<></>
												),
												accessor: 'trader',
												Cell: (cellProps: CellProps<any>) => {
													const avatar = useENSAvatar(
														staticMainnetProvider,
														cellProps.row.original.traderEns
													);
													return (
														<StyledOrderType
															onClick={() =>
																onClickTrader(
																	cellProps.row.original.trader,
																	cellProps.row.original.traderEns
																)
															}
														>
															{compact && cellProps.row.original.rank + '. '}
															<StyledTrader>
																{avatar ? (
																	<>
																		{!avatar.isLoading && avatar.data && (
																			<img
																				src={avatar.data}
																				alt={''}
																				width={16}
																				height={16}
																				style={{ borderRadius: '50%', marginRight: '8px' }}
																				// @ts-ignore
																				onError={(err) => (err.target.style.display = 'none')}
																			/>
																		)}
																		{cellProps.row.original.traderEns}
																	</>
																) : (
																	cellProps.row.original.traderEns ??
																	cellProps.row.original.traderShort
																)}
															</StyledTrader>
															{getMedal(cellProps.row.original.rank)}
														</StyledOrderType>
													);
												},
												width: 175,
											},
											{
												Header: (
													<TableHeader>
														{t('leaderboard.leaderboard.table.total-trades')}
													</TableHeader>
												),
												accessor: 'totalTrades',
												sortType: 'basic',
												width: 100,
												sortable: true,
											},
											{
												Header: (
													<TableHeader>
														{t('leaderboard.leaderboard.table.liquidations')}
													</TableHeader>
												),
												accessor: 'liquidations',
												sortType: 'basic',
												width: 100,
												sortable: true,
											},
											{
												Header: (
													<TableHeader>
														{t('leaderboard.leaderboard.table.total-volume')}
													</TableHeader>
												),
												accessor: 'totalVolume',
												sortType: 'basic',
												Cell: (cellProps: CellProps<any>) => (
													<Currency.Price
														currencyKey={Synths.sUSD}
														price={cellProps.row.original.totalVolume}
														sign={'$'}
														conversionRate={1}
													/>
												),
												width: compact ? 'auto' : 125,
												sortable: true,
											},
											{
												Header: (
													<TableHeader>{t('leaderboard.leaderboard.table.total-pnl')}</TableHeader>
												),
												accessor: 'pnl',
												sortType: 'basic',
												Cell: (cellProps: CellProps<any>) => (
													<ColorCodedPrice
														currencyKey={Synths.sUSD}
														price={cellProps.row.original.pnl}
														sign={'$'}
														conversionRate={1}
													/>
												),
												width: compact ? 'auto' : 100,
												sortable: true,
											},
										],
									},
								]}
							/>
						</MobileHiddenView>
						<MobileOnlyView>
							<StyledTable
								compact={compact}
								data={data}
								showPagination
								pageSize={DEFAULT_LEADERBOARD_ROWS}
								isLoading={statsQuery.isLoading || ensInfoQuery.isLoading}
								hideHeaders={compact}
								columns={[
									{
										Header: () => (
											<TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>
										),
										accessor: 'rank',
										Cell: (cellProps: CellProps<any>) => (
											<StyledOrderType>{cellProps.row.original.rank}</StyledOrderType>
										),
										width: 45,
									},
									{
										Header: () => (
											<TableHeader>{t('leaderboard.leaderboard.table.trader')}</TableHeader>
										),
										accessor: 'trader',
										Cell: (cellProps: CellProps<any>) => {
											const avatar = useENSAvatar(
												staticMainnetProvider,
												cellProps.row.original.traderEns
											);
											return (
												<StyledOrderType
													onClick={() =>
														onClickTrader(
															cellProps.row.original.trader,
															cellProps.row.original.traderEns
														)
													}
												>
													{compact && cellProps.row.original.rank + '. '}
													<StyledTrader>
														{avatar ? (
															<>
																{!avatar.isLoading && avatar.data && (
																	<img
																		src={avatar.data}
																		alt={''}
																		width={16}
																		height={16}
																		style={{ borderRadius: '50%', marginRight: '8px' }}
																		// @ts-ignore
																		onError={(err) => (err.target.style.display = 'none')}
																	/>
																)}
																{cellProps.row.original.traderEns}
															</>
														) : (
															cellProps.row.original.traderEns ?? cellProps.row.original.traderShort
														)}
													</StyledTrader>
													{getMedal(cellProps.row.original.rank)}
												</StyledOrderType>
											);
										},
										width: 150,
									},
									{
										Header: () => (
											<TableHeader>{t('leaderboard.leaderboard.table.pnl')}</TableHeader>
										),
										accessor: 'pnl',
										Cell: (cellProps: CellProps<any>) => (
											<ColorCodedPrice
												currencyKey={Synths.sUSD}
												price={cellProps.row.original.pnl}
												sign="$"
											/>
										),
										width: 125,
									},
								]}
							/>
						</MobileOnlyView>
					</>
				)}
			</TableContainer>
		</>
	);
};

const Medal = styled.span`
	font-size: 16px;
	margin-left: 4px;
`;

const ColorCodedPrice = styled(Currency.Price)`
	align-items: right;
	color: ${(props) =>
		props.price > 0
			? props.theme.colors.selectedTheme.green
			: props.price < 0
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.button.text};
`;

const SearchContainer = styled.div`
	display: flex;
	margin-top: 16px;
	height: 35px;
`;

const TableContainer = styled.div<{ compact: boolean | undefined }>`
	margin-top: 6px;
	margin-bottom: ${({ compact }) => (compact ? '0' : '40px')};
`;

const StyledTable = styled(Table)<{ compact: boolean | undefined }>`
	margin-top: ${({ compact }) => (compact ? '0' : '15px')};
`;

const TableTitle = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`;

const TitleText = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const TableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	display: flex;
	align-items: center;
`;

const StyledTrader = styled.a`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	display: flex;

	&:hover {
		text-decoration: underline;
		cursor: pointer;
	}
`;

export default Leaderboard;
