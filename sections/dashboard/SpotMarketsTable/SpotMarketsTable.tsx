import * as _ from 'lodash/fp';
import values from 'lodash/values';
import { useRouter } from 'next/router';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import MarketBadge from 'components/Badge/MarketBadge';
import ChangePercent from 'components/ChangePercent';
import Currency from 'components/Currency';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table from 'components/Table';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import Connector from 'containers/Connector';
import useGetSynthsTradingVolumeForAllMarkets from 'queries/synths/useGetSynthsTradingVolumeForAllMarkets';
import { selectPreviousDayRates } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { selectPrices } from 'state/prices/selectors';
import { isDecimalFour, MarketKeyByAsset, FuturesMarketAsset } from 'utils/futures';

const SpotMarketsTable: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const prices = useAppSelector(selectPrices);
	const pastRates = useAppSelector(selectPreviousDayRates);

	const { synthsMap } = Connector.useContainer();
	const synths = useMemo(() => values(synthsMap) || [], [synthsMap]);

	const yesterday = Math.floor(new Date().setDate(new Date().getDate() - 1) / 1000);
	const synthVolumesQuery = useGetSynthsTradingVolumeForAllMarkets(yesterday);

	let data = useMemo(() => {
		return synths.map((synth) => {
			const description = synth.description
				? t('common.currency.synthetic-currency-name', {
						currencyName: synth.description,
				  })
				: '';
			const rate = prices && prices[synth.name].onChain;
			const price = _.isNil(rate) ? 0 : rate.toNumber();
			const pastPrice = pastRates.find((price) => price.synth === synth.asset);
			const synthVolumes = synthVolumesQuery?.data ?? {};
			return {
				asset: synth.asset,
				market: synth.name,
				marketKey: MarketKeyByAsset[synth.asset as FuturesMarketAsset],
				synth: synthsMap[synth.asset],
				description,
				price,
				change:
					price !== 0 && pastPrice?.price
						? (price - (pastPrice?.price ?? 0)) / price || null
						: null,
				volume: synthVolumes[synth.name] ?? 0,
			};
		});
	}, [synthsMap, synths, synthVolumesQuery, pastRates, prices, t]);

	return (
		<>
			<DesktopOnlyView>
				<TableContainer>
					<StyledTable
						data={data}
						showPagination
						onTableRowClick={(row) => {
							row.original.market !== 'sUSD'
								? router.push(`/exchange/?quote=sUSD&base=${row.original.market}`)
								: router.push(`/exchange/`);
						}}
						highlightRowsOnHover
						sortBy={[{ id: 'price', desc: true }]}
						columns={[
							{
								Header: <div>{t('dashboard.overview.spot-markets-table.market')}</div>,
								accessor: 'market',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<MarketContainer>
											<IconContainer>
												<StyledCurrencyIcon
													currencyKey={
														(cellProps.row.original.asset[0] !== 's' ? 's' : '') +
														cellProps.row.original.asset
													}
												/>
											</IconContainer>
											<StyledText>
												{cellProps.row.original.market}
												<MarketBadge
													currencyKey={cellProps.row.original.asset}
													isFuturesMarketClosed={cellProps.row.original.isSuspended}
													futuresClosureReason={cellProps.row.original.marketClosureReason}
												/>
											</StyledText>
											<StyledValue>{cellProps.row.original.description}</StyledValue>
										</MarketContainer>
									);
								},
								width: 190,
							},
							{
								Header: <div>{t('dashboard.overview.spot-markets-table.price')}</div>,
								accessor: 'price',
								Cell: (cellProps: CellProps<any>) => {
									const formatOptions = isDecimalFour(cellProps.row.original.asset)
										? { minDecimals: DEFAULT_CRYPTO_DECIMALS }
										: {};
									return (
										<Currency.Price
											currencyKey="sUSD"
											price={cellProps.row.original.price}
											sign="$"
											conversionRate={1}
											formatOptions={formatOptions}
										/>
									);
								},
								width: 130,
								sortable: true,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne = rowA.original.price ?? 0;
										const rowTwo = rowB.original.price ?? 0;
										return rowOne > rowTwo ? 1 : -1;
									},
									[]
								),
							},
							{
								Header: <div>{t('dashboard.overview.spot-markets-table.24h-change')}</div>,
								accessor: '24hChange',
								Cell: (cellProps: CellProps<any>) => {
									return cellProps.row.original.change === '-' ? (
										<p>-</p>
									) : (
										<ChangePercent
											value={cellProps.row.original.change}
											decimals={2}
											className="change-pct"
										/>
									);
								},
								width: 105,
								sortable: true,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne = rowA.original.change;
										const rowTwo = rowB.original.change;
										return rowOne > rowTwo ? 1 : -1;
									},
									[]
								),
							},
							{
								Header: <div>{t('dashboard.overview.spot-markets-table.24h-vol')}</div>,
								accessor: '24hVolume',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<Currency.Price
											currencyKey="sUSD"
											price={cellProps.row.original.volume}
											sign="$"
											conversionRate={1}
										/>
									);
								},
								width: 125,
								sortable: true,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne = rowA.original.volume;
										const rowTwo = rowB.original.volume;
										return rowOne > rowTwo ? 1 : -1;
									},
									[]
								),
							},
						]}
					/>
				</TableContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledMobileTable
					data={data}
					showPagination
					onTableRowClick={(row) => {
						row.original.market !== 'sUSD'
							? router.push(`/exchange/?quote=sUSD&base=${row.original.market}`)
							: router.push(`/exchange/`);
					}}
					sortBy={[
						{
							id: 'price',
							desc: true,
						},
					]}
					columns={[
						{
							Header: <div>{t('dashboard.overview.spot-markets-table.market')}</div>,
							accessor: 'market',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<MarketContainer>
										<IconContainer>
											<StyledCurrencyIcon
												currencyKey={
													(cellProps.row.original.asset[0] !== 's' ? 's' : '') +
													cellProps.row.original.asset
												}
											/>
										</IconContainer>
										<StyledText>
											{cellProps.row.original.market}
											<MarketBadge
												currencyKey={cellProps.row.original.asset}
												isFuturesMarketClosed={cellProps.row.original.isSuspended}
												futuresClosureReason={cellProps.row.original.marketClosureReason}
											/>
										</StyledText>
										<StyledValue>{cellProps.row.original.description}</StyledValue>
									</MarketContainer>
								);
							},
							width: 190,
						},
						{
							Header: <div>{t('dashboard.overview.spot-markets-table.24h-change')}</div>,
							accessor: '24hChange',
							Cell: (cellProps: CellProps<any>) => {
								return cellProps.row.original.change === '-' ? (
									<p>-</p>
								) : (
									<ChangePercent
										value={cellProps.row.original.change}
										decimals={2}
										className="change-pct"
									/>
								);
							},
							width: 105,
							sortable: true,
							sortType: useMemo(
								() => (rowA: any, rowB: any) => {
									const rowOne = rowA.original.change;
									const rowTwo = rowB.original.change;
									return rowOne > rowTwo ? 1 : -1;
								},
								[]
							),
						},
						{
							Header: <div>{t('dashboard.overview.spot-markets-table.24h-vol')}</div>,
							accessor: '24hVolume',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<Currency.Price
										currencyKey="sUSD"
										price={cellProps.row.original.volume}
										sign="$"
										conversionRate={1}
									/>
								);
							},
							width: 125,
							sortable: true,
							sortType: useMemo(
								() => (rowA: any, rowB: any) => {
									const rowOne = rowA.original.volume;
									const rowTwo = rowB.original.volume;
									return rowOne > rowTwo ? 1 : -1;
								},
								[]
							),
						},
					]}
				/>
			</MobileOrTabletView>
		</>
	);
};

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`;

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`;

const TableContainer = styled.div`
	margin-top: 16px;
	margin-bottom: '40px';

	.paused {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

const StyledTable = styled(Table)`
	margin-bottom: 20px;
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: -4px;
	grid-column: 2;
	grid-row: 1;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-family: ${(props) => props.theme.fonts.bold};
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

const StyledMobileTable = styled(StyledTable)`
	border-radius: initial;
	border-top: none;
	border-left: none;
	border-right: none;
`;

export default SpotMarketsTable;
