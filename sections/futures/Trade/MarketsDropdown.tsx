import { wei } from '@synthetixio/wei';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import FavoriteIcon from 'assets/svg/futures/favorite-star.svg';
import SelectedIcon from 'assets/svg/futures/selected-fav.svg';
import MarketBadge from 'components/Badge/MarketBadge';
import ColoredPrice from 'components/ColoredPrice';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { FlexDivRowCentered } from 'components/layout/flex';
import Spacer from 'components/Spacer';
import Table, { TableHeader, TableNoResults } from 'components/Table';
import Search from 'components/Table/Search';
import { Body } from 'components/Text';
import NumericValue from 'components/Text/NumericValue';
import ROUTES from 'constants/routes';
import useClickOutside from 'hooks/useClickOutside';
import { FuturesMarketAsset } from 'sdk/types/futures';
import { getDisplayAsset } from 'sdk/utils/futures';
import {
	selectMarketAsset,
	selectMarkets,
	selectMarketsQueryStatus,
	selectFuturesType,
	selectMarketInfo,
	selectMarkPriceInfos,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { selectPreviousDayPrices } from 'state/prices/selectors';
import { FetchStatus } from 'state/types';
import { floorNumber, formatDollars, zeroBN } from 'utils/formatters/number';
import { getMarketName, getSynthDescription, MarketKeyByAsset } from 'utils/futures';

import MarketsDropdownSelector from './MarketsDropdownSelector';

type MarketsDropdownProps = {
	mobile?: boolean;
};

const MarketsDropdown: React.FC<MarketsDropdownProps> = ({ mobile }) => {
	const markPrices = useAppSelector(selectMarkPriceInfos);
	const pastPrices = useAppSelector(selectPreviousDayPrices);
	const accountType = useAppSelector(selectFuturesType);
	const marketAsset = useAppSelector(selectMarketAsset);
	const futuresMarkets = useAppSelector(selectMarkets);
	const marketsQueryStatus = useAppSelector(selectMarketsQueryStatus);

	const marketInfo = useAppSelector(selectMarketInfo);
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [isSelected, setIsSelected] = useState(false);

	const { ref } = useClickOutside(() => setOpen(false));

	const router = useRouter();
	const { t } = useTranslation();

	const onSelect = useCallback(() => setIsSelected(!isSelected), [isSelected]);

	const getBasePriceRateInfo = useCallback(
		(asset: FuturesMarketAsset) => {
			return markPrices[MarketKeyByAsset[asset]];
		},
		[markPrices]
	);

	const getPastPrice = useCallback(
		(asset: string) => pastPrices.find((price) => price.synth === getDisplayAsset(asset)),
		[pastPrices]
	);

	const selectedBasePriceRate = getBasePriceRateInfo(marketAsset);
	const selectedPastPrice = getPastPrice(marketAsset);

	const options = useMemo(() => {
		const markets = search
			? futuresMarkets.filter((m) => m.asset.toLowerCase().includes(search.toLowerCase()))
			: futuresMarkets;
		return markets.map((market) => {
			const pastPrice = getPastPrice(market.asset);
			const basePriceRate = getBasePriceRateInfo(market.asset);

			return {
				value: market.asset,
				label: getMarketName(market.asset),
				asset: market.asset,
				key: market.marketKey,
				description: getSynthDescription(market.asset, t),
				priceNum: basePriceRate?.price.toNumber() ?? 0,
				price: formatDollars(basePriceRate?.price ?? '0', { suggestDecimals: true }),
				change:
					basePriceRate && pastPrice?.rate && basePriceRate.price.gt(0)
						? wei(basePriceRate.price).sub(pastPrice?.rate).div(basePriceRate.price)
						: zeroBN,
				priceDirection: basePriceRate?.change ?? null,
				isMarketClosed: market.isSuspended,
				closureReason: market.marketClosureReason,
			};
		});
	}, [futuresMarkets, search, t, getBasePriceRateInfo, getPastPrice]);

	const isFetching = !futuresMarkets.length && marketsQueryStatus.status === FetchStatus.Loading;

	return (
		<SelectContainer mobile={mobile} ref={ref}>
			<MarketsDropdownSelector
				onClick={() => setOpen(!open)}
				mobile={mobile}
				asset={marketAsset}
				label={getMarketName(marketAsset)}
				description={getSynthDescription(marketAsset, t)}
				isMarketClosed={marketInfo?.isSuspended}
				closureReason={marketInfo?.marketClosureReason}
				priceDetails={{
					oneDayChange:
						selectedBasePriceRate?.price &&
						selectedPastPrice?.rate &&
						selectedBasePriceRate.price.gt(0)
							? wei(selectedBasePriceRate.price)
									.sub(selectedPastPrice.rate)
									.div(selectedBasePriceRate.price)
							: zeroBN,
					priceInfo: selectedBasePriceRate,
				}}
			/>
			{open && (
				<MarketsList
					mobile={mobile}
					height={Math.max(window.innerHeight - (mobile ? 135 : 170), 300)}
				>
					<SearchBarContainer>
						<Search autoFocus onChange={setSearch} value={search} border={false} />
					</SearchBarContainer>
					<TableContainer>
						<StyledTable
							highlightRowsOnHover
							rowStyle={{ padding: '0' }}
							onTableRowClick={(row) => {
								router.push(ROUTES.Markets.MarketPair(row.original.asset, accountType));
								setOpen(false);
							}}
							columns={[
								{
									Header: (
										<TableHeader>
											<FavoriteIcon />
										</TableHeader>
									),
									accessor: 'favorite',
									sortType: 'basic',
									sortable: false,
									Cell: ({ _ }: any) => (
										<div onClick={onSelect}>{isSelected ? <SelectedIcon /> : <FavoriteIcon />}</div>
									),
									width: 25,
								},
								{
									Header: <TableHeader>{t('futures.markets-drop-down.market')}</TableHeader>,
									accessor: 'label',
									sortType: 'basic',
									sortable: true,
									Cell: ({ row }: any) => (
										<FlexDivRowCentered>
											<CurrencyIcon currencyKey={row.original.key} width="18px" height="18px" />
											<Spacer width={10} />
											<Body>{getDisplayAsset(row.original.asset)}</Body>
										</FlexDivRowCentered>
									),
									width: 80,
								},
								{
									Header: <TableHeader>{t('futures.markets-drop-down.price')}</TableHeader>,
									accessor: 'priceNum',
									sortType: 'basic',
									sortable: true,
									Cell: (cellProps: any) => {
										return (
											<ColoredPrice
												priceInfo={{
													price: cellProps.row.original.price,
													change: cellProps.row.original.priceDirection,
												}}
											>
												{cellProps.row.original.price}
											</ColoredPrice>
										);
									},
									width: 80,
								},
								{
									Header: <TableHeader>{t('futures.markets-drop-down.change')}</TableHeader>,
									Cell: ({ row }: any) => {
										return (
											<MarketBadge
												currencyKey={row.original.asset}
												isFuturesMarketClosed={row.original.isMarketClosed}
												futuresClosureReason={row.original.closureReason}
												fallbackComponent={
													<NumericValue
														suffix="%"
														colored
														value={floorNumber(row.original.change?.mul(100) ?? '0', 2)}
													/>
												}
											/>
										);
									},
									accessor: 'change',
									sortType: 'basic',
									sortable: true,
									width: 50,
								},
							]}
							data={options}
							isLoading={isFetching}
							noResultsMessage={
								options?.length === 0 ? (
									<TableNoResults>
										<Body color="secondary" size="large">
											{t('futures.markets-drop-down.no-results')}
										</Body>
									</TableNoResults>
								) : undefined
							}
						/>
					</TableContainer>
				</MarketsList>
			)}
		</SelectContainer>
	);
};

const MarketsList = styled.div<{ mobile?: boolean; height: number }>`
	top: 66px;
	z-index: 100;
	height: ${(props) => props.height}px;
	width: 380px;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	${(props) =>
		props.mobile &&
		css`
			width: 100%;
		`}
`;

const TableContainer = styled.div`
	height: 100%;
	overflow: scroll;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`;

const StyledTable = styled(Table)<{ mobile?: boolean }>`
	border: none;
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	.table-body-row {
		padding: 0;
	}

	.table-body-row:last-child {
		border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	}

	.table-body-cell {
		height: 32px;
	}
`;

const SearchBarContainer = styled.div`
	font-size: 13px;
	width: 100%;
	height: 38px;
	top: 0;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`;

const SelectContainer = styled.div<{ mobile?: boolean }>`
	height: 100%;
	z-index: 100;
	${(props) =>
		props.mobile &&
		css`
			position: absolute;
			width: 100%;
			top: 0;
			z-index: 5;
		`}
`;

export default MarketsDropdown;
