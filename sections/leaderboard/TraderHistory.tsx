import router from 'next/router';
import { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import Currency from 'components/Currency';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { FlexDiv } from 'components/layout/flex';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import FuturesIcon from 'components/Nav/FuturesIcon';
import Table, { TableHeader } from 'components/Table';
import ROUTES from 'constants/routes';
import { FuturesAccountTypes } from 'queries/futures/types';
import useGetFuturesPositionHistoryForAccount from 'queries/futures/useGetFuturesPositionHistoryForAccount';
import TimeDisplay from 'sections/futures/Trades/TimeDisplay';
import { ExternalLink } from 'styles/common';
import { getMarketName } from 'utils/futures';

type TraderHistoryProps = {
	trader: string;
	ensInfo: Record<string, string>;
	resetSelection: Function;
	compact?: boolean;
	searchTerm?: string | undefined;
};

const TraderHistory: FC<TraderHistoryProps> = memo(
	({ trader, ensInfo, resetSelection, compact, searchTerm }) => {
		const { t } = useTranslation();
		const positionsQuery = useGetFuturesPositionHistoryForAccount(trader);
		const positions = useMemo(() => {
			const positionData = positionsQuery.data;
			return positionData
				? [
						...positionData[FuturesAccountTypes.ISOLATED_MARGIN],
						...positionData[FuturesAccountTypes.CROSS_MARGIN],
				  ]
				: [];
		}, [positionsQuery]);
		const traderENSName = useMemo(() => ensInfo[trader] ?? null, [trader, ensInfo]);

		let data = useMemo(() => {
			return positions
				.sort((a, b) => b.timestamp - a.timestamp)
				.map((stat, i) => {
					return {
						...stat,
						rank: i + 1,
						currencyIconKey: stat.asset ? (stat.asset[0] !== 's' ? 's' : '') + stat.asset : '',
						marketShortName: getMarketName(stat.asset),
						status: stat.isOpen ? 'Open' : stat.isLiquidated ? 'Liquidated' : 'Closed',
						pnl: stat.pnlWithFeesPaid,
						pnlPct: `(${stat.pnlWithFeesPaid
							.div(stat.initialMargin.add(stat.totalDeposits))
							.mul(100)
							.toNumber()
							.toFixed(2)}%)`,
					};
				})
				.filter((i) =>
					searchTerm?.length
						? i.marketShortName.toLowerCase().includes(searchTerm) ||
						  i.status.toLowerCase().includes(searchTerm)
						: true
				);
		}, [positions, searchTerm]);

		return (
			<>
				<DesktopOnlyView>
					<StyledTable
						compact={compact}
						showPagination
						pageSize={10}
						isLoading={positionsQuery.isLoading}
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
											{t('leaderboard.trader-history.table.back')}
										</TitleText>
										<TitleSeparator>&gt;</TitleSeparator>
										<ExternalLink
											href={`https://optimistic.etherscan.io/address/${trader}`}
											hoverUnderline
										>
											{traderENSName ?? trader}
										</ExternalLink>
									</TableTitle>
								),
								accessor: 'title',
								columns: [
									{
										Header: (
											<TableHeader>{t('leaderboard.trader-history.table.timestamp')}</TableHeader>
										),
										accessor: 'openTimestamp',
										Cell: (cellProps: CellProps<typeof data[number]>) => {
											return (
												<StyledCell>
													<TimeDisplay value={cellProps.row.original.openTimestamp} />
												</StyledCell>
											);
										},
										sortType: 'basic',
										sortable: true,
										width: compact ? 40 : 100,
									},
									{
										Header: (
											<TableHeader>{t('leaderboard.trader-history.table.market')}</TableHeader>
										),
										accessor: 'asset',
										Cell: (cellProps: CellProps<typeof data[number]>) => (
											<CurrencyInfo>
												<StyledCurrencyIcon currencyKey={cellProps.row.original.currencyIconKey} />
												<StyledSubtitle>{cellProps.row.original.marketShortName}</StyledSubtitle>
												<StyledFuturesIcon type={cellProps.row.original.accountType} />
											</CurrencyInfo>
										),
										width: compact ? 40 : 100,
									},
									{
										Header: (
											<TableHeader>{t('leaderboard.trader-history.table.status')}</TableHeader>
										),
										accessor: 'status',
										Cell: (cellProps: CellProps<typeof data[number]>) => {
											return <StyledCell>{cellProps.row.original.status}</StyledCell>;
										},
										width: compact ? 40 : 100,
									},
									{
										Header: (
											<TableHeader>
												{t('leaderboard.trader-history.table.total-trades')}
											</TableHeader>
										),
										accessor: 'trades',
										width: compact ? 40 : 100,
										sortType: 'basic',
										sortable: true,
									},
									{
										Header: (
											<TableHeader>
												{t('leaderboard.trader-history.table.total-volume')}
											</TableHeader>
										),
										accessor: 'totalVolume',
										Cell: (cellProps: CellProps<typeof data[number]>) => (
											<Currency.Price
												currencyKey="sUSD"
												price={cellProps.row.original.totalVolume}
												sign="$"
												conversionRate={1}
											/>
										),
										width: compact ? 40 : 100,
										sortType: 'basic',
										sortable: true,
									},
									{
										Header: (
											<TableHeader>{t('leaderboard.trader-history.table.total-pnl')}</TableHeader>
										),
										accessor: 'pnl',
										Cell: (cellProps: CellProps<typeof data[number]>) => (
											<PnlContainer>
												<ColorCodedPrice
													currencyKey="sUSD"
													price={cellProps.row.original.pnl}
													sign="$"
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
										width: compact ? 40 : 100,
										sortType: 'basic',
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
										<ExternalLink
											href={`https://optimistic.etherscan.io/address/${trader}`}
											hoverUnderline
										>
											{traderENSName ?? trader}
										</ExternalLink>
									</TableTitle>
								),
								accessor: 'title',
								columns: [
									{
										Header: (
											<TableHeader>{t('leaderboard.trader-history.table.market')}</TableHeader>
										),
										accessor: 'asset',
										Cell: (cellProps: CellProps<any>) => (
											<CurrencyInfo>
												<StyledCurrencyIcon currencyKey={cellProps.row.original.currencyIconKey} />
												<StyledSubtitle>{cellProps.row.original.marketShortName}</StyledSubtitle>
												<StyledFuturesIcon type={cellProps.row.original.accountType} />
											</CurrencyInfo>
										),
										width: 50,
									},
									{
										Header: (
											<TableHeader>{t('leaderboard.trader-history.table.status')}</TableHeader>
										),
										accessor: 'status',
										Cell: (cellProps: CellProps<typeof data[number]>) => {
											return <StyledCell>{cellProps.row.original.status}</StyledCell>;
										},
										width: 30,
									},
									{
										Header: (
											<TableHeader>{t('leaderboard.trader-history.table.total-pnl')}</TableHeader>
										),
										accessor: 'pnl',
										Cell: (cellProps: CellProps<typeof data[number]>) => (
											<PnlContainer>
												<ColorCodedPrice
													currencyKey="sUSD"
													price={cellProps.row.original.pnl}
													sign="$"
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
	}
);

const StyledTable = styled(Table)<{ compact?: boolean }>`
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
	}
`;

const StyledCell = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	display: flex;
`;

const TitleSeparator = styled.div`
	margin-left: 10px;
	margin-right: 10px;
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
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
			: props.theme.colors.selectedTheme.button.text.primary};
`;

const StyledValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	color: ${(props) =>
		props.color === 'green'
			? props.theme.colors.selectedTheme.green
			: props.color === 'red'
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.button.text.primary};
	margin: 0;
	text-align: end;
`;

const StyledFuturesIcon = styled(FuturesIcon)`
	margin-left: 5px;
`;

export default TraderHistory;
