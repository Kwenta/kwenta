import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Table from 'components/Table';
import { Synths } from 'constants/currency';
import { DEFAULT_LEADERBOARD_ROWS } from 'constants/defaults';
import Connector from 'containers/Connector';
import useENSAvatar from 'hooks/useENSAvatar';
import { walletAddressState } from 'store/wallet';

import { AccountStat, getMedal, PIN, StyledTrader } from '../common';

type AllTimeProps = {
	stats: AccountStat[];
	isLoading: boolean;
	searchTerm: string;
	onClickTrader: (trader: string) => void;
	compact?: boolean;
};

const AllTime: FC<AllTimeProps> = ({ stats, isLoading, searchTerm, onClickTrader, compact }) => {
	const { t } = useTranslation();
	const walletAddress = useRecoilValue(walletAddressState);

	const { staticMainnetProvider } = Connector.useContainer();

	if (compact) {
		const ownPosition = stats.findIndex((i: { account: string }) => {
			return i.account.toLowerCase() === walletAddress?.toLowerCase();
		});

		const anchorPosition = ownPosition !== -1 && ownPosition > 10 ? stats[ownPosition] : null;

		stats = stats.slice(0, 10);

		if (anchorPosition) {
			stats.push(anchorPosition);
		}
	}

	const data = useMemo(() => {
		const statsData = stats
			.sort((a: AccountStat, b: AccountStat) => a.rank - b.rank)
			.map((trader: any, i: number) => {
				const pinText = trader.account === walletAddress ? PIN : '';

				return {
					...trader,
					rankText: `${trader.rank}${pinText}`,
				};
			})
			.filter((i: { trader: string; traderEns: string }) =>
				searchTerm?.length
					? i.trader.toLowerCase().includes(searchTerm) ||
					  i.traderEns?.toLowerCase().includes(searchTerm)
					: true
			);

		return [
			...statsData.filter(
				(trader) => trader.account.toLowerCase() === walletAddress?.toLowerCase()
			),
			...statsData.filter(
				(trader) => trader.account.toLowerCase() !== walletAddress?.toLowerCase()
			),
		];
	}, [stats, searchTerm, walletAddress]);

	return (
		<>
			<MobileHiddenView>
				<StyledTable
					compact={compact}
					showPagination
					isLoading={isLoading}
					data={data}
					pageSize={10}
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
									sortType: 'basic',
									width: 80,
									sortable: true,
								},
								{
									Header: (
										<TableHeader>{t('leaderboard.leaderboard.table.liquidations')}</TableHeader>
									),
									accessor: 'liquidations',
									sortType: 'basic',
									width: 80,
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
									width: compact ? 'auto' : 100,
									sortable: true,
								},
								{
									Header: <TableHeader>{t('leaderboard.leaderboard.table.pnl')}</TableHeader>,
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
					isLoading={false}
					hideHeaders={compact}
					columns={[
						{
							Header: () => <TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>,
							accessor: 'rank',
							Cell: (cellProps: CellProps<any>) => (
								<StyledOrderType>{cellProps.row.original.rank}</StyledOrderType>
							),
							width: 45,
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
							Header: () => <TableHeader>{t('leaderboard.leaderboard.table.pnl')}</TableHeader>,
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
	);
};

const ColorCodedPrice = styled(Currency.Price)`
	align-items: right;
	color: ${(props) =>
		props.price > 0
			? props.theme.colors.selectedTheme.green
			: props.price < 0
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.button.text};
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

export default AllTime;
