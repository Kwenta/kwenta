import { wei } from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import * as _ from 'lodash/fp';
import Link from 'next/link';
import React, { FC, useMemo, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Currency from 'components/Currency';
import Table, { TableNoResults } from 'components/Table';
import PositionType from 'components/Text/PositionType';
import { Synths } from 'constants/currency';
import { ETH_UNIT } from 'constants/network';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { FuturesTrade } from 'queries/futures/types';
import useGetAllFuturesTradesForAccount from 'queries/futures/useGetAllFuturesTradesForAccount';
import { TradeStatus } from 'sections/futures/types';
import { futuresAccountState, futuresAccountTypeState } from 'store/futures';
import { isL2State } from 'store/wallet';
import { formatCryptoCurrency, formatCurrency } from 'utils/formatters/number';
import { FuturesMarketAsset, getMarketName, MarketKeyByAsset } from 'utils/futures';

import TimeDisplay from '../../futures/Trades/TimeDisplay';

const FuturesHistoryTable: FC = () => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const accountType = useRecoilValue(futuresAccountTypeState);

	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const { switchToL2 } = useNetworkSwitcher();
	const futuresTradesQuery = useGetAllFuturesTradesForAccount(selectedFuturesAddress);
	const trades: FuturesTrade[] = useMemo(
		() => (futuresTradesQuery.isSuccess ? futuresTradesQuery?.data ?? [] : []),
		[futuresTradesQuery.isSuccess, futuresTradesQuery.data]
	);

	const mappedHistoricalTrades = useMemo(
		() =>
			trades.map((trade) => {
				const parsedAsset = ethersUtils.parseBytes32String(trade.asset) as FuturesMarketAsset;
				return {
					...trade,
					asset: parsedAsset,
					market: getMarketName(parsedAsset),
					price: Number(trade.price?.div(ETH_UNIT)),
					size: Number(trade.size.div(ETH_UNIT).abs()),
					timestamp: Number(trade.timestamp.mul(1000)),
					pnl: trade.pnl.div(ETH_UNIT),
					feesPaid: trade.feesPaid.div(ETH_UNIT),
					id: trade.txnHash,
					orderType: trade.orderType === 'NextPrice' ? 'Next Price' : trade.orderType,
					status: trade.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
				};
			}),
		[trades]
	);

	const conditionalRender = <T,>(prop: T, children: ReactElement): ReactElement =>
		_.isNil(prop) ? <p>{NO_VALUE}</p> : children;

	return (
		<TableContainer>
			<StyledTable
				data={isL2 ? mappedHistoricalTrades : []}
				showPagination
				isLoading={futuresTradesQuery.isLoading}
				noResultsMessage={
					!isL2 ? (
						<TableNoResults>
							{t('common.l2-cta')}
							<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
						</TableNoResults>
					) : (
						<TableNoResults>
							{t('dashboard.history.futures-history-table.no-result')}
							<Link href={ROUTES.Markets.Home(accountType)}>
								<div>{t('common.perp-cta')}</div>
							</Link>
						</TableNoResults>
					)
				}
				highlightRowsOnHover
				sortBy={[{ id: 'dateTime', asec: true }]}
				columns={[
					{
						Header: <div>{t('dashboard.history.futures-history-table.date-time')}</div>,
						accessor: 'dateTime',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							return conditionalRender(
								cellProps.row.original.timestamp,
								<StyledTimeDisplay>
									<TimeDisplay cellPropsValue={cellProps.row.original.timestamp} />
								</StyledTimeDisplay>
							);
						},
						width: 100,
					},
					{
						Header: <div>{t('dashboard.history.futures-history-table.market')}</div>,
						accessor: 'market',
						Cell: (cellProps: CellProps<typeof mappedHistoricalTrades[number]>) => {
							return conditionalRender(
								cellProps.row.original.asset,
								<SynthContainer>
									{cellProps.row.original.asset && (
										<>
											<IconContainer>
												<StyledCurrencyIcon
													currencyKey={
														MarketKeyByAsset[cellProps.row.original.asset as FuturesMarketAsset]
													}
												/>
											</IconContainer>
											<StyledText>{cellProps.row.original.market}</StyledText>
										</>
									)}
								</SynthContainer>
							);
						},
						width: 120,
					},
					{
						Header: <div>{t('dashboard.history.futures-history-table.side')}</div>,
						accessor: 'side',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							return conditionalRender(
								cellProps.row.original.side,
								<PositionType side={cellProps.value} />
							);
						},
						width: 70,
					},
					{
						Header: <div>{t('dashboard.history.futures-history-table.size')}</div>,
						accessor: 'size',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							return conditionalRender(
								cellProps.row.original.size,
								<>{formatCryptoCurrency(cellProps.value)}</>
							);
						},
						width: 100,
					},
					{
						Header: <div>{t('dashboard.history.futures-history-table.price')}</div>,
						accessor: 'price',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							return conditionalRender(
								cellProps.row.original.price,
								<>
									{formatCurrency(Synths.sUSD, cellProps.value, {
										sign: '$',
									})}
								</>
							);
						},
						width: 120,
					},
					{
						Header: <div>{t('dashboard.history.futures-history-table.pnl')}</div>,
						accessor: 'pnl',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							return conditionalRender(
								cellProps.row.original.pnl,
								cellProps.row.original.pnl.eq(wei(0)) ? (
									<PNL normal>--</PNL>
								) : (
									<PNL negative={cellProps.value.lt(wei(0))}>
										{formatCurrency(Synths.sUSD, cellProps.value, {
											sign: '$',
										})}
									</PNL>
								)
							);
						},
						width: 120,
					},
					{
						Header: <div>{t('dashboard.history.futures-history-table.fees')}</div>,
						accessor: 'fees',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							return conditionalRender(
								cellProps.row.original.feesPaid,
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.feesPaid}
									sign={selectedPriceCurrency.sign}
									conversionRate={selectPriceCurrencyRate}
								/>
							);
						},
						width: 120,
					},
					{
						Header: <div>{t('dashboard.history.futures-history-table.order-type')}</div>,
						accessor: 'orderType',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							return conditionalRender(
								cellProps.row.original.orderType,
								<StyledText>{cellProps.row.original.orderType}</StyledText>
							);
						},
						width: 80,
					},
				]}
			/>
		</TableContainer>
	);
};

const StyledTimeDisplay = styled.div`
	div {
		margin-left: 2px;
	}
`;

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 5px;
`;

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`;

const TableContainer = styled.div`
	margin-top: 16px;
	margin-bottom: '40px';
	font-family: ${(props) => props.theme.fonts.regular};
	.paused {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

const StyledTable = styled(Table)`
	margin-bottom: 20px;
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;
const SynthContainer = styled.div`
	display: flex;
	align-items: center;
	grid-column: 3;
	grid-row: 1;
	column-gap: 5px;
	margin-left: -4px;
`;

const PNL = styled.div<{ negative?: boolean; normal?: boolean }>`
	color: ${(props) =>
		props.normal
			? props.theme.colors.selectedTheme.button.text.primary
			: props.negative
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.green};
`;

export default FuturesHistoryTable;
