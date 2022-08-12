import { wei } from '@synthetixio/wei';
import { useRouter } from 'next/router';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import MarketBadge from 'components/Badge/MarketBadge';
import ChangePercent from 'components/ChangePercent';
import Currency from 'components/Currency';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table from 'components/Table';
import { Synths } from 'constants/currency';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import Connector from 'containers/Connector';
import { FundingRateResponse } from 'queries/futures/useGetAverageFundingRateForMarkets';
import useGetFuturesTradingVolumeForAllMarkets from 'queries/futures/useGetFuturesTradingVolumeForAllMarkets';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import { fundingRatesState, futuresMarketsState } from 'store/futures';
import {
	getSynthDescription,
	isEurForex,
	MarketKeyByAsset,
	FuturesMarketAsset,
} from 'utils/futures';

const FuturesMarketsTable: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const { synthsMap } = Connector.useContainer();

	const futuresMarkets = useRecoilValue(futuresMarketsState);
	const fundingRates = useRecoilValue(fundingRatesState);

	const synthList = futuresMarkets.map(({ asset }) => asset);
	const dailyPriceChangesQuery = useLaggedDailyPrice(synthList);

	const futuresVolumeQuery = useGetFuturesTradingVolumeForAllMarkets();

	let data = useMemo(() => {
		const dailyPriceChanges = dailyPriceChangesQuery.data ?? [];
		const futuresVolume = futuresVolumeQuery.data ?? {};

		return futuresMarkets.map((market) => {
			const description = getSynthDescription(market.asset, synthsMap, t);
			const volume = futuresVolume[market.assetHex];
			const pastPrice = dailyPriceChanges.find((price) => price.synth === market.asset);
			const fundingRate = fundingRates.find(
				(funding) => (funding as FundingRateResponse)?.asset === MarketKeyByAsset[market.asset]
			);

			return {
				asset: market.asset,
				market: market.marketName,
				synth: synthsMap[market.asset],
				description,
				price: market.price,
				volume: volume?.toNumber() ?? 0,
				pastPrice: pastPrice?.price,
				priceChange: market.price.sub(pastPrice?.price ?? 0).div(market.price),
				fundingRate: fundingRate?.fundingRate ?? null,
				openInterest: market.marketSize.mul(market.price),
				openInterestNative: market.marketSize,
				longInterest: market.marketSize.add(market.marketSkew).div('2').abs().mul(market.price),
				shortInterest: market.marketSize.sub(market.marketSkew).div('2').abs().mul(market.price),
				marketSkew: market.marketSkew,
				isSuspended: market.isSuspended,
				marketClosureReason: market.marketClosureReason,
			};
		});
	}, [
		synthsMap,
		futuresMarkets,
		fundingRates,
		dailyPriceChangesQuery?.data,
		futuresVolumeQuery?.data,
		t,
	]);

	return (
		<>
			<DesktopOnlyView>
				<TableContainer>
					<StyledTable
						data={data}
						showPagination
						onTableRowClick={(row) => {
							router.push(`/market/?asset=${row.original.asset}`);
						}}
						highlightRowsOnHover
						sortBy={[{ id: 'dailyVolume', desc: true }]}
						columns={[
							{
								Header: (
									<TableHeader>{t('dashboard.overview.futures-markets-table.market')}</TableHeader>
								),
								accessor: 'market',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<MarketContainer>
											<IconContainer>
												<StyledCurrencyIcon
													currencyKey={
														MarketKeyByAsset[cellProps.row.original.asset as FuturesMarketAsset]
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
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.oracle-price')}
									</TableHeader>
								),
								accessor: 'oraclePrice',
								Cell: (cellProps: CellProps<any>) => {
									const formatOptions = isEurForex(cellProps.row.original.asset)
										? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS }
										: {};
									return (
										<Currency.Price
											currencyKey={Synths.sUSD}
											price={cellProps.row.original.price}
											sign={'$'}
											conversionRate={1}
											formatOptions={formatOptions}
										/>
									);
								},
								width: 130,
								sortable: true,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne = rowA.original.price ?? wei(0);
										const rowTwo = rowB.original.price ?? wei(0);
										return rowOne.toSortable() > rowTwo.toSortable() ? 1 : -1;
									},
									[]
								),
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.daily-change')}
									</TableHeader>
								),
								accessor: 'priceChange',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<ChangePercent
											value={cellProps.row.original.priceChange}
											decimals={2}
											className="change-pct"
										/>
									);
								},
								width: 105,
								sortable: true,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne = rowA.original.priceChange ?? wei(0);
										const rowTwo = rowB.original.priceChange ?? wei(0);
										return rowOne.toNumber() > rowTwo.toNumber() ? -1 : 1;
									},
									[]
								),
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.funding-rate')}
									</TableHeader>
								),
								accessor: 'fundingRate',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<ChangePercent
											value={cellProps.row.original.fundingRate}
											decimals={6}
											showArrow={false}
											className="change-pct"
										/>
									);
								},
								sortable: true,
								width: 125,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne = rowA.original.fundingRate ?? wei(0);
										const rowTwo = rowB.original.fundingRate ?? wei(0);
										return rowOne.toNumber() > rowTwo.toNumber() ? -1 : 1;
									},
									[]
								),
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.open-interest')}
									</TableHeader>
								),
								accessor: 'openInterest',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<OpenInterestContainer>
											<StyledLongPrice
												currencyKey={Synths.sUSD}
												price={cellProps.row.original.longInterest}
												sign={'$'}
											/>
											<StyledShortPrice
												currencyKey={Synths.sUSD}
												price={cellProps.row.original.shortInterest}
												sign={'$'}
											/>
										</OpenInterestContainer>
									);
								},
								width: 125,
								sortable: true,
								sortType: useMemo(
									() => (rowA: any, rowB: any) => {
										const rowOne =
											rowA.original.longInterest.add(rowA.original.shortInterest) ?? wei(0);
										const rowTwo =
											rowB.original.longInterest.add(rowB.original.shortInterest) ?? wei(0);
										return rowOne.toSortable() > rowTwo.toSortable() ? 1 : -1;
									},
									[]
								),
							},
							{
								Header: (
									<TableHeader>
										{t('dashboard.overview.futures-markets-table.daily-volume')}
									</TableHeader>
								),
								accessor: 'dailyVolume',
								Cell: (cellProps: CellProps<any>) => {
									return (
										<Currency.Price
											currencyKey={Synths.sUSD}
											price={cellProps.row.original.volume}
											sign={'$'}
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
						router.push(`/market/?asset=${row.original.asset}`);
					}}
					columns={[
						{
							Header: () => (
								<div>
									<TableHeader>Market</TableHeader>
									<TableHeader>Oracle</TableHeader>
								</div>
							),
							accessor: 'market',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div>
										<MarketContainer>
											<IconContainer>
												<StyledCurrencyIcon
													currencyKey={
														MarketKeyByAsset[cellProps.row.original.asset as FuturesMarketAsset]
													}
												/>
											</IconContainer>
											<StyledText>{cellProps.row.original.market}</StyledText>
											<Currency.Price
												currencyKey={Synths.sUSD}
												price={cellProps.row.original.price}
												sign="$"
												formatOptions={
													isEurForex(cellProps.row.original.asset)
														? { minDecimals: DEFAULT_FIAT_EURO_DECIMALS }
														: {}
												}
											/>
										</MarketContainer>
									</div>
								);
							},
							width: 145,
						},
						{
							Header: () => (
								<div>
									<TableHeader>Open Interest</TableHeader>
									<TableHeader>1H Funding</TableHeader>
								</div>
							),
							accessor: 'openInterest',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div>
										<Currency.Price
											currencyKey={Synths.sUSD}
											price={cellProps.row.original.openInterest}
											sign="$"
										/>
										<div>
											<ChangePercent
												showArrow={false}
												value={cellProps.row.original.fundingRate}
												decimals={6}
												className="change-pct"
											/>
										</div>
									</div>
								);
							},
							width: 130,
						},
						{
							Header: () => (
								<div>
									<TableHeader>24H Change</TableHeader>
									<TableHeader>24H Volume</TableHeader>
								</div>
							),
							accessor: '24h-change',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div>
										<div>
											<ChangePercent
												value={cellProps.row.original.priceChange ?? 0}
												decimals={2}
												className="change-pct"
											/>
										</div>
										<div>
											<Currency.Price
												currencyKey={Synths.sUSD}
												price={cellProps.row.original.volume ?? 0}
												sign="$"
											/>
										</div>
									</div>
								);
							},
							width: 120,
						},
					]}
				/>
			</MobileOrTabletView>
		</>
	);
};

const StyledLongPrice = styled(Currency.Price)`
	color: ${(props) => props.theme.colors.selectedTheme.green};
`;

const StyledShortPrice = styled(Currency.Price)`
	color: ${(props) => props.theme.colors.selectedTheme.red};
`;

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

const OpenInterestContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
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

const TableHeader = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: -4px;
	grid-column: 2;
	grid-row: 1;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
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

export default FuturesMarketsTable;
