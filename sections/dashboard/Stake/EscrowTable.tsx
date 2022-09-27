import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table from 'components/Table';
import { TableCellHead } from 'components/Table/Table';
import { currentThemeState } from 'store/ui';

import { StakingCard } from './common';

const EscrowTable = () => {
	const { t } = useTranslation();
	const data = useMemo(() => [], []);

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	return (
		<EscrowTableContainer $noPadding $darkTheme={isDarkTheme}>
			<DesktopOnlyView>
				<StyledTable
					data={data}
					columns={[
						{
							Header: () => (
								<div>
									<input type="checkbox" />
								</div>
							),
							Cell: () => (
								<div>
									<input type="checkbox" />
								</div>
							),
							accessor: 'selected',
							width: 40,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.date-time')}
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'date',
							width: 65,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									<div>{t('dashboard.stake.tabs.escrow.time-until-vestable')}</div>
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'timeUntilVestable',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									<div>{t('dashboard.stake.tabs.escrow.immediately-vestable')}</div>
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'immediatelyVestable',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.amount')}
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'amount',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									<div>{t('dashboard.stake.tabs.escrow.early-vest-fee')}</div>
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'earlyVestFee',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.status')}
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'status',
							width: 50,
						},
					]}
				/>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledTable
					data={data}
					columns={[
						{
							Header: () => (
								<div>
									<input type="checkbox" />
								</div>
							),
							Cell: () => (
								<div>
									<input type="checkbox" />
								</div>
							),
							accessor: 'selected',
							width: 40,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.amount')}
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'amount',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.early-vest-fee')}
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'earlyVestFee',
							width: 80,
						},
						{
							Header: () => (
								<TableHeader $darkTheme={isDarkTheme}>
									{t('dashboard.stake.tabs.escrow.status')}
								</TableHeader>
							),
							Cell: () => <div />,
							accessor: 'status',
							width: 50,
						},
					]}
				/>
			</MobileOrTabletView>
			<EscrowStats $darkTheme={isDarkTheme}>
				<div>
					<div>
						<div className="stat-title">{t('dashboard.stake.tabs.escrow.total')}</div>
						<div className="stat-value">10 KWENTA</div>
					</div>
					<div>
						<div className="stat-title">{t('dashboard.stake.tabs.escrow.fee')}</div>
						<div className="stat-value">10 KWENTA</div>
					</div>
					<VestButton $darkTheme={isDarkTheme}>{t('dashboard.stake.tabs.escrow.vest')}</VestButton>
				</div>
			</EscrowStats>
		</EscrowTableContainer>
	);
};

const EscrowTableContainer = styled(StakingCard)<{ $darkTheme: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const StyledTable = styled(Table)`
	width: 100%;
	border: none;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;

	${TableCellHead} {
		&:first-child {
			padding-left: 14px;
		}
	}
`;

const TableHeader = styled.div<{ $darkTheme: boolean }>`
	font-size: 10px;
	color: ${(props) => (props.$darkTheme ? props.theme.colors.selectedTheme.text.title : '#6A3300')};
`;

const EscrowStats = styled.div<{ $darkTheme: boolean }>`
	display: flex;
	justify-content: flex-end;
	margin-top: 22px;
	padding: 18px;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};

	.stat-title {
		font-size: 10px;
		color: ${(props) =>
			props.$darkTheme ? props.theme.colors.selectedTheme.text.title : '#323232'};
	}

	.stat-value {
		font-size: 11px;
		font-family: ${(props) => props.theme.fonts.mono};
		color: ${(props) =>
			props.$darkTheme
				? props.theme.colors.selectedTheme.text.value
				: props.theme.colors.selectedTheme.black};
		margin-top: 4px;
	}

	& > div {
		display: flex;
		align-items: center;

		& > *:not(:last-child) {
			margin-right: 15px;
		}
	}
`;

const VestButton = styled.button<{ $darkTheme: boolean }>`
	border-width: 1px;
	border-style: solid;
	border-color: ${(props) =>
		props.$darkTheme ? props.theme.colors.selectedTheme.yellow : '#6A3300'};
	height: 24px;
	box-sizing: border-box;
	border-radius: 14px;
	cursor: pointer;
	background-color: transparent;
	color: ${(props) => (props.$darkTheme ? props.theme.colors.selectedTheme.yellow : '#6A3300')};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	padding-left: 12px;
	padding-right: 12px;
	text-transform: uppercase;
`;

export default EscrowTable;
