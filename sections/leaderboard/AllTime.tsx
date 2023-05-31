import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Table, { TableHeader } from 'components/Table';
import { TableCell } from 'components/Table/TableBodyRow';
import { BANNER_HEIGHT_DESKTOP } from 'constants/announcement';
import { DEFAULT_LEADERBOARD_ROWS } from 'constants/defaults';
import useENSAvatar from 'hooks/useENSAvatar';
import { AccountStat } from 'queries/futures/types';
import { StyledTrader } from 'sections/leaderboard/trader';
import { selectShowBanner } from 'state/app/selectors';
import { useAppSelector } from 'state/hooks';
import { selectWallet } from 'state/wallet/selectors';
import { FOOTER_HEIGHT } from 'styles/common';
import media from 'styles/media';
import { getMedal } from 'utils/competition';
import { staticMainnetProvider } from 'utils/network';

type AllTimeProps = {
	stats: AccountStat[];
	isLoading: boolean;
	pinRow: AccountStat[];
	onClickTrader: (trader: string) => void;
	compact?: boolean;
	activeTab?: string;
};

const AllTime: FC<AllTimeProps> = ({
	stats,
	isLoading,
	pinRow,
	onClickTrader,
	compact,
	activeTab,
}) => {
	const { t } = useTranslation();
	const walletAddress = useAppSelector(selectWallet);
	const showBanner = useAppSelector(selectShowBanner);

	if (compact) {
		const ownPosition = stats.findIndex((i) => {
			return i.account.toLowerCase() === walletAddress?.toLowerCase();
		});

		const anchorPosition = ownPosition !== -1 && ownPosition > 10 ? stats[ownPosition] : null;

		stats = stats.slice(0, 10);

		if (anchorPosition) {
			stats.push(anchorPosition);
		}
	}

	const data = useMemo(() => {
		return [...pinRow, ...stats];
	}, [stats, pinRow]);

	const tableHeight = useMemo(
		() => window.innerHeight - FOOTER_HEIGHT - 161 - Number(showBanner) * BANNER_HEIGHT_DESKTOP,
		[showBanner]
	);

	return (
		<>
			<MobileHiddenView>
				<StyledTable
					height={tableHeight}
					compact={compact}
					showPagination
					isLoading={isLoading}
					data={data}
					pageSize={10}
					hideHeaders={compact}
					hiddenColumns={
						compact ? ['rank', 'totalTrades', 'liquidations', 'totalVolume', 'pnl'] : undefined
					}
					columnsDeps={[activeTab]}
					columns={[
						{
							Header: (
								<TableTitle>
									<TitleText>
										{activeTab} {t('leaderboard.leaderboard.table.title')}
									</TitleText>
								</TableTitle>
							),
							accessor: 'title',
							columns: [
								{
									Header: <TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>,
									accessor: 'rank',
									Cell: (cellProps: CellProps<any>) => (
										<StyledOrderType>{cellProps.row.original.rankText}</StyledOrderType>
									),
									width: compact ? 40 : 60,
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
											<StyledOrderType onClick={() => onClickTrader(cellProps.row.original.trader)}>
												{compact && cellProps.row.original.rank + '. '}
												<StyledTrader>
													{avatar?.data ? (
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
									width: 120,
								},
								{
									Header: (
										<TableHeader>{t('leaderboard.leaderboard.table.total-trades')}</TableHeader>
									),
									accessor: 'totalTrades',
									width: 80,
								},
								{
									Header: (
										<TableHeader>{t('leaderboard.leaderboard.table.liquidations')}</TableHeader>
									),
									accessor: 'liquidations',
									width: 80,
								},
								{
									Header: (
										<TableHeader>{t('leaderboard.leaderboard.table.total-volume')}</TableHeader>
									),
									accessor: 'totalVolume',
									Cell: (cellProps: CellProps<any>) => (
										<Currency.Price price={cellProps.row.original.totalVolume} />
									),
									width: compact ? 'auto' : 100,
								},
								{
									Header: <TableHeader>{t('leaderboard.leaderboard.table.pnl')}</TableHeader>,
									accessor: 'pnl',
									Cell: (cellProps: CellProps<any>) => (
										<Currency.Price
											currencyKey="sUSD"
											price={cellProps.row.original.pnl}
											sign="$"
											conversionRate={1}
											colored={true}
										/>
									),
									width: compact ? 'auto' : 100,
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
					isLoading={false}
					hideHeaders={compact}
					columns={[
						{
							Header: () => <TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>,
							accessor: 'rank',
							Cell: (cellProps: CellProps<any>) => (
								<StyledOrderType>{cellProps.row.original.rankText}</StyledOrderType>
							),
							width: 60,
						},
						{
							Header: () => <TableHeader>{t('leaderboard.leaderboard.table.trader')}</TableHeader>,
							accessor: 'trader',
							Cell: (cellProps: CellProps<any>) => {
								const avatar = useENSAvatar(
									staticMainnetProvider,
									cellProps.row.original.traderEns
								);
								return (
									<StyledOrderType onClick={() => onClickTrader(cellProps.row.original.trader)}>
										{compact && cellProps.row.original.rank + '. '}
										<StyledTrader>
											{avatar?.data ? (
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
							Header: () => <TableHeader>{t('leaderboard.leaderboard.table.pnl')}</TableHeader>,
							accessor: 'pnl',
							Cell: (cellProps: CellProps<any>) => (
								<Currency.Price
									currencyKey="sUSD"
									price={cellProps.row.original.pnl}
									sign="$"
									colored={true}
								/>
							),
							width: 125,
						},
					]}
				/>
			</MobileOnlyView>
		</>
	);
};

const StyledTable = styled(Table)<{ compact: boolean | undefined; height?: number }>`
	margin-top: ${({ compact }) => (compact ? '0' : '15px')};
	height: ${({ height }) => (height ? height + 'px' : 'auto')};
	max-height: 665px;

	${TableCell} {
		padding-top: 8px;
		padding-bottom: 8px;
	}

	${media.lessThan('lg')`
		max-height: 600px;
	`}

	${media.lessThan('md')`
		margin-bottom: 150px;
	`}
`;

const TableTitle = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`;

const TitleText = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	text-transform: capitalize;
`;

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	display: flex;
	align-items: center;
`;

export default AllTime;
