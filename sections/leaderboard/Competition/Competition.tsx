import router from 'next/router';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Currency from 'components/Currency';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import Loader from 'components/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table from 'components/Table';
import { Synths } from 'constants/currency';
import ROUTES from 'constants/routes';
import useGetFile from 'queries/files/useGetFile';
import { walletAddressState } from 'store/wallet';
import { FlexDiv } from 'styles/common';
import { formatCurrency, formatPercent } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';

import { getMedal } from '../Leaderboard/Leaderboard';
import { COMPETITION_DATA_LOCATION } from './constants';

type CompetitionProps = {
	resetSelection: Function;
	compact?: boolean;
	searchTerm?: string | undefined;
};

type Tier = 'gold' | 'silver' | 'bronze';
const TIERS: Tier[] = ['bronze', 'silver', 'gold'];

const Competition: FC<CompetitionProps> = ({
	resetSelection,
	compact,
	searchTerm,
}: CompetitionProps) => {
	const { t } = useTranslation();
	const [activeTier, setActiveTier] = useState<Tier>('gold');
	const walletAddress = useRecoilValue(walletAddressState);
	const competitionQuery = useGetFile(COMPETITION_DATA_LOCATION);

	let data = useMemo(() => {
		const competitionData = competitionQuery?.data ?? [];
		return competitionData
			.map((trader: any, i: number) => {
				return {
					trader: trader.account,
					tier: trader.tier,
					rank: trader.rank,
					traderShort: truncateAddress(trader.account),
					pnl: `${formatCurrency(Synths.sUSD, trader.pnl, {
						sign: '$',
						minDecimals: trader?.pnlPct?.abs().lt(0.01) ? 4 : 2,
					})}`,
					pnlPct: `(${formatPercent(trader?.pnl_pct)})`,
					totalVolume: trader.volume,
					totalTrades: trader.trades,
					liquidations: trader.liquidations,
				};
			})
			.filter((trader: { tier: string }) => trader.tier === activeTier)
			.filter((i: { trader: string; traderEns: string }) =>
				searchTerm?.length
					? i.trader.toLowerCase().includes(searchTerm) ||
					  i.traderEns?.toLowerCase().includes(searchTerm)
					: true
			);
	}, [competitionQuery, searchTerm, activeTier]);

	if (competitionQuery.isLoading) {
		return <Loader />;
	}

	return (
		<>
			<DesktopOnlyView>
				<StyledTable
					compact={compact}
					showPagination
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
										{t('leaderboard.competition.title')}
									</TitleText>
									<TitleSeparator>&gt;</TitleSeparator>
									{TIERS.map((tier: Tier) => (
										<TierText active={activeTier === tier} onClick={() => setActiveTier(tier)}>
											{tier}
										</TierText>
									))}
								</TableTitle>
							),
							accessor: 'title',
							columns: [
								{
									Header: <TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>,
									accessor: 'rank',
									sortType: 'basic',
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
										return (
											<StyledOrderType>
												{compact && cellProps.row.original.rank + '. '}
												<StyledValue>{cellProps.row.original.traderShort}</StyledValue>
												{getMedal(cellProps.row.original.rank)}
											</StyledOrderType>
										);
									},
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
									Header: <TableHeader>{t('leaderboard.leaderboard.table.pnl')}</TableHeader>,
									accessor: 'pnl',
									sortType: 'basic',
									Cell: (cellProps: CellProps<any>) => (
										<StyledValue>
											{cellProps.row.original.pnl} {cellProps.row.original.pnlPct}
										</StyledValue>
									),
									width: compact ? 'auto' : 100,
									sortable: true,
								},
							],
						},
					]}
				/>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledTable
					data={data}
					compact={compact}
					hideHeaders={compact}
					isLoading={false}
					showPagination
					pageSize={10}
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
									{TIERS.map((tier: Tier) => (
										<TierText active={activeTier === tier} onClick={() => setActiveTier(tier)}>
											{tier}
										</TierText>
									))}
								</TableTitle>
							),
							accessor: 'title',
							columns: [
								{
									Header: <TableHeader>{t('leaderboard.trader-history.table.market')}</TableHeader>,
									accessor: 'asset',
									Cell: (cellProps: CellProps<any>) => (
										<CurrencyInfo>
											<StyledCurrencyIcon currencyKey={cellProps.row.original.currencyIconKey} />
											<StyledSubtitle>{cellProps.row.original.marketShortName}</StyledSubtitle>
										</CurrencyInfo>
									),
									width: 40,
								},
								{
									Header: <TableHeader>{t('leaderboard.trader-history.table.status')}</TableHeader>,
									accessor: 'status',
									Cell: (cellProps: CellProps<any>) => {
										return <StyledCell>{cellProps.row.original.status}</StyledCell>;
									},
									width: 40,
								},
								{
									Header: (
										<TableHeader>{t('leaderboard.trader-history.table.total-pnl')}</TableHeader>
									),
									accessor: 'pnl',
									Cell: (cellProps: CellProps<any>) => (
										<PnlContainer>
											<ColorCodedPrice
												currencyKey={Synths.sUSD}
												price={cellProps.row.original.pnl}
												sign={'$'}
												conversionRate={1}
											/>
											<StyledValue
												color={
													cellProps.row.original.pnl.gt(0)
														? 'green'
														: cellProps.row.original.pnl.lt(0)
														? 'red'
														: ''
												}
											>
												{cellProps.row.original.pnlPct}
											</StyledValue>
										</PnlContainer>
									),
									width: 40,
									sortType: 'basic',
									sortable: true,
								},
							],
						},
					]}
				/>
			</MobileOrTabletView>
		</>
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
	color: ${(props) => props.theme.colors.selectedTheme.gray};

	&:hover {
		text-decoration: underline;
		cursor: pointer;
	}
`;

const StyledCell = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	display: flex;
`;

const TitleSeparator = styled.div`
	margin-left: 10px;
	margin-right: 10px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const TierText = styled.a<{ active: boolean }>`
	padding: 0px 10px;
	color: ${(props) =>
		props.active ? props.theme.colors.selectedTheme.gold : props.theme.colors.selectedTheme.white};
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.button.text};

	&:hover {
		text-decoration: underline;
		cursor: pointer;
	}
`;

const TableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	text-transform: capitalize;
`;

const PnlContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
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

const StyledValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	color: ${(props) =>
		props.color === 'green'
			? props.theme.colors.selectedTheme.green
			: props.color === 'red'
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.button.text};
	margin: 0;
	text-align: end;
`;

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	display: flex;
	align-items: center;
`;

export default Competition;
