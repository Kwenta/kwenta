import Table from 'components/Table';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import Currency from 'components/Currency';
import { Synths } from 'constants/currency';
import { wei } from '@synthetixio/wei';
import useGetRegisteredParticpants from 'queries/futures/useGetRegisteredParticpants';
import useGetStats from 'queries/futures/useGetStats';
import Search from 'components/Table/Search';

type LeaderboardProps = {
	compact?: boolean;
};

const Leaderboard: FC<LeaderboardProps> = ({ compact }: LeaderboardProps) => {
	const { t } = useTranslation();

	const [searchTerm, setSearchTerm] = useState<string | null>();

	const participantsQuery = useGetRegisteredParticpants();
	const participants = useMemo(() => participantsQuery.data ?? [], [participantsQuery]);

	const pnlQueries = useGetStats(participants.map(({ address }) => address));
	const pnls: any = pnlQueries.map((query) => query.data);
	const pnlMap = Object.assign({}, ...pnls);

	const onChangeSearch = (text: string) => {
		setSearchTerm(text);
	};

	let data = useMemo(() => {
		return participants
			.map((participant) => ({
				//rank: 1,
				trader: '@' + participant.username,
				totalTrades: (pnlMap[participant.address]?.totalTrades ?? wei(0)).toNumber(),
				liquidations: (pnlMap[participant.address]?.liquidations ?? wei(0)).toNumber(),
				'24h': 80000,
				pnl: (pnlMap[participant.address]?.pnl ?? wei(0)).toNumber(),
			}))
			.sort((a, b) => b.pnl - a.pnl)
			.filter((i) => (searchTerm?.length ? i.trader.includes(searchTerm) : true));
	}, [participants, pnlMap, searchTerm]);

	if (compact) {
		data = data.slice(0, 10);
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

	return (
		<TableContainer>
			<Search onChange={onChangeSearch} />
			<StyledTable
				showPagination={true}
				isLoading={participantsQuery.isLoading && !participantsQuery.isSuccess}
				data={data}
				hideHeaders={compact}
				hiddenColumns={compact ? ['rank', 'totalTrades', 'liquidations'] : undefined}
				columns={[
					{
						Header: <TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>,
						accessor: 'rank',
						Cell: (cellProps: CellProps<any>) => (
							<StyledOrderType>{cellProps.row.index + 1}</StyledOrderType>
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
							<StyledOrderType>
								{compact && cellProps.row.index + 1 + '. '}
								{cellProps.row.original.trader}
								{getMedal(cellProps.row.index + 1)}
							</StyledOrderType>
						),
						width: 175,
					},
					{
						Header: <TableHeader>{t('leaderboard.leaderboard.table.total-trades')}</TableHeader>,
						accessor: 'totalTrades',
						sortType: 'basic',
						width: 175,
						sortable: true,
					},
					{
						Header: <TableHeader>{t('leaderboard.leaderboard.table.liquidations')}</TableHeader>,
						accessor: 'liquidations',
						sortType: 'basic',
						width: 175,
						sortable: true,
					},
					{
						Header: <TableHeader>{t('leaderboard.leaderboard.table.total-pnl')}</TableHeader>,
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
						width: compact ? 'auto' : 175,
						sortable: true,
					},
				]}
			/>
		</TableContainer>
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

const TableContainer = styled.div`
	margin-top: 16px;
`;

const StyledTable = styled(Table)`
	margin-top: 20px;
`;

const TableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
`;

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.white};
	display: flex;
`;

export default Leaderboard;
