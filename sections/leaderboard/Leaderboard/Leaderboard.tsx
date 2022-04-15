import Table from 'components/Table';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import Currency from 'components/Currency';
import { Synths } from 'constants/currency';
import useGetStats from 'queries/futures/useGetStats';
import { walletAddressState } from 'store/wallet';
import { truncateAddress } from 'utils/formatters/string';
import { FuturesStat } from 'queries/futures/types';
import { useRouter } from 'next/router';
import Loader from 'components/Loader';
import TraderHistory from '../TraderHistory';
import Search from 'components/Table/Search';
import ROUTES from 'constants/routes';

type LeaderboardProps = {
	compact?: boolean;
};

type Stat = {
	pnl: Wei;
	liquidations: Wei;
	totalTrades: Wei;
	totalVolume: Wei;
};

const Leaderboard: FC<LeaderboardProps> = ({ compact }: LeaderboardProps) => {
	const { t } = useTranslation();
	const [searchTerm, setSearchTerm] = useState<string | undefined>();
	const [selectedTrader, setSelectedTrader] = useState('');
	const router = useRouter();

	const walletAddress = useRecoilValue(walletAddressState);

	const statsQuery = useGetStats();
	const stats = useMemo(() => statsQuery.data ?? [], [statsQuery]);

	useMemo(() => {
		if (router.query.tab) {
			const trader = router.query.tab[0];
			setSelectedTrader(trader);
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
			.sort(
				(a: FuturesStat, b: FuturesStat) =>
					(pnlMap[b.account]?.pnl || 0) - (pnlMap[a.account]?.pnl || 0)
			)
			.map((stat: FuturesStat, i: number) => ({
				rank: i + 1,
				address: stat.account,
				trader: stat.account,
				traderShort: truncateAddress(stat.account),
				totalTrades: (pnlMap[stat.account]?.totalTrades ?? wei(0)).toNumber(),
				totalVolume: (pnlMap[stat.account]?.totalVolume ?? wei(0)).toNumber(),
				liquidations: (pnlMap[stat.account]?.liquidations ?? wei(0)).toNumber(),
				'24h': 80000,
				pnl: (pnlMap[stat.account]?.pnl ?? wei(0)).toNumber(),
			}))
			.filter((i: { trader: string }) =>
				searchTerm?.length ? i.trader.toLowerCase().includes(searchTerm) : true
			);
	}, [stats, searchTerm, pnlMap]);

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

	const getMedal = (position: number) => {
		switch (position) {
			case 1:
				return <Medal>🥇</Medal>;
			case 2:
				return <Medal>🥈</Medal>;
			case 3:
				return <Medal>🥉</Medal>;
		}
	};

	const onClickTrader = (trader: string) => {
		setSearchTerm('');
		setSelectedTrader(trader);
		router.push(ROUTES.Leaderboard.Trader(trader));
	};

	if (statsQuery.isLoading) {
		return <Loader />;
	}

	return (
		<>
			<SearchContainer>
				<Search value={searchTerm} onChange={onChangeSearch} disabled={selectedTrader !== ''} />
			</SearchContainer>
			<TableContainer compact={compact}>
				{selectedTrader !== '' ? (
					<TraderHistory
						trader={selectedTrader}
						resetSelection={() => setSelectedTrader('')}
						compact={compact}
					/>
				) : (
					<StyledTable
						compact={compact}
						showPagination={true}
						isLoading={statsQuery.isLoading}
						data={data}
						pageSize={20}
						hideHeaders={compact}
						hiddenColumns={
							compact ? ['rank', 'totalTrades', 'liquidations', 'totalVolume', 'pnl'] : undefined
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
										Header: <TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>,
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
										Cell: (cellProps: CellProps<any>) => (
											<StyledOrderType onClick={() => onClickTrader(cellProps.row.original.trader)}>
												{compact && cellProps.row.original.rank + '. '}
												<StyledTrader>{cellProps.row.original.traderShort}</StyledTrader>
												{getMedal(cellProps.row.index + 1)}
											</StyledOrderType>
										),
										width: 175,
									},
									{
										Header: (
											<TableHeader>{t('leaderboard.leaderboard.table.total-trades')}</TableHeader>
										),
										accessor: 'totalTrades',
										sortType: 'basic',
										width: 100,
										sortable: true,
									},
									{
										Header: (
											<TableHeader>{t('leaderboard.leaderboard.table.liquidations')}</TableHeader>
										),
										accessor: 'liquidations',
										sortType: 'basic',
										width: 100,
										sortable: true,
									},
									{
										Header: (
											<TableHeader>{t('leaderboard.leaderboard.table.total-volume')}</TableHeader>
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
			? props.theme.colors.green
			: props.price < 0
			? props.theme.colors.red
			: props.theme.colors.white};
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
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const TableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.white};
	display: flex;
	align-items: center;
`;

const StyledTrader = styled.a`
	color: ${(props) => props.theme.colors.white};
	display: flex;

	&:hover {
		text-decoration: underline;
		cursor: pointer;
	}
`;

export default Leaderboard;
