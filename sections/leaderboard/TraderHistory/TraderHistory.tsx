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
import useGetStats from 'queries/futures/useGetStats';
import { walletAddressState } from 'store/wallet';
import { truncateAddress } from 'utils/formatters/string';
import { FuturesStat } from 'queries/futures/types';
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

	return (
		<TableContainer compact={compact}>
			<StyledTable
				compact={compact}
				showPagination={true}
				isLoading={false}
				data={[]}
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
								<TraderText>{trader}</TraderText>
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

const TraderText = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.primaryWhite};
`;

const TableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

export default TraderHistory;
