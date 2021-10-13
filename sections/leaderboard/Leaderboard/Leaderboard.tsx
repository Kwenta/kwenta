import Table from 'components/Table';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import Currency from 'components/Currency';
import { Synths } from 'constants/currency';
import { wei } from '@synthetixio/wei';
import useGetRegisteredParticpants from 'queries/futures/useGetRegisteredParticpants';
import useGetStats from 'queries/futures/useGetStats';

const Leaderboard: FC = () => {
	const { t } = useTranslation();

	const participantsQuery = useGetRegisteredParticpants();
	const participants = useMemo(() => participantsQuery.data ?? [], [participantsQuery]);

	const pnlQueries = useGetStats(participants.map(({ address }) => address));
	const pnls: any = pnlQueries.map((query) => query.data);
	const pnlMap = Object.assign({}, ...pnls);

	const data = useMemo(() => {
		return participants
			.map((participant) => ({
				//rank: 1,
				trader: participant.username,
				totalTrades: (pnlMap[participant.address]?.totalTrades ?? wei(0)).toNumber(),
				liquidations: (pnlMap[participant.address]?.liquidations ?? wei(0)).toNumber(),
				'24h': 80000,
				pnl: (pnlMap[participant.address]?.pnl ?? wei(0)).toNumber(),
			}))
			.sort((a, b) => b.pnl - a.pnl);
	}, [participants, pnlMap]);

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
		<>
			<StyledTable
				showPagination={true}
				isLoading={participantsQuery.isLoading && !participantsQuery.isSuccess}
				data={data}
				columns={[
					{
						Header: <TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>,
						accessor: 'rank',
						Cell: (cellProps: CellProps<any>) => (
							<StyledOrderType>
								{cellProps.row.index + 1}
								{getMedal(cellProps.row.index + 1)}
							</StyledOrderType>
						),
						width: 100,
					},
					{
						Header: <TableHeader>{t('leaderboard.leaderboard.table.trader')}</TableHeader>,
						accessor: 'trader',
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
						width: 175,
						sortable: true,
					},
				]}
			/>
		</>
	);
};

const Medal = styled.span`
	font-size: 16px;
	margin-left: 4px;
`;

const ColorCodedPrice = styled(Currency.Price)`
	color: ${(props) =>
		props.price > 0
			? props.theme.colors.green
			: props.price < 0
			? props.theme.colors.red
			: props.theme.colors.white};
`;

const StyledTable = styled(Table)`
	margin-top: 16px;
	background-color: black;
`;

const TableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
`;

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.white};
	display: flex;
	align-items: center;
`;

export default Leaderboard;
