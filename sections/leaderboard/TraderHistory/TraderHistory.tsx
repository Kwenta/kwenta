import Table from 'components/Table';
import { FC, SyntheticEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import Currency from 'components/Currency';
import ChangePercent from 'components/ChangePercent';
import { Synths } from 'constants/currency';
import useGetFuturesAccountPositionHistory from 'queries/futures/useGetFuturesAccountPositionHistory';
import { PositionHistory } from 'queries/futures/types';
import Loader from 'components/Loader';

type TraderHistoryProps = {
	trader: string;
	resetSelection: Function;
	compact?: boolean;
};

const TraderHistory: FC<TraderHistoryProps> = ({
	trader,
	resetSelection,
	compact,
}: TraderHistoryProps) => {
	const { t } = useTranslation();

	const positionsQuery = useGetFuturesAccountPositionHistory(trader);
	const positions = useMemo(() => positionsQuery.data ?? [], [positionsQuery]);

	let data = useMemo(() => {
		return positions
			.sort(
				(a: PositionHistory, b: PositionHistory) =>
					a.timestamp - b.timestamp
			)
			.map((stat: PositionHistory, i: number) => ({
				rank: i + 1,
				openTimestamp: stat.openTimestamp,
				asset: stat.asset,
				isOpen: stat.isOpen,
				feesPaid: stat.feesPaid,
				netFunding: stat.netFunding,
				pnl: stat.pnl,
				totalVolume: stat.totalVolume,
				trades: stat.trades,
				side: stat.side
			}))
	}, [positions])
	console.log(positions)

	return (
		<TableContainer compact={compact}>
			<StyledTable
				compact={compact}
				showPagination={true}
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
									{trader}
								</TraderText>
							</TableTitle>
						),
						accessor: 'title',
						columns: [
							{
								Header: <TableHeader>Test</TableHeader>,
								accessor: 'rank',
								Cell: (cellProps: CellProps<any>) => <p>Test</p>,
								width: compact ? 40 : 100,
							},
						],
					},
				]}
			/>
		</TableContainer>
	);

	return <></>;
};

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

export default TraderHistory;
