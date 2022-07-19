import { wei } from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import * as _ from 'lodash/fp';
import React, { FC, useMemo, ReactElement } from 'react';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import Link from 'next/link';
import ROUTES from 'constants/routes';

import { Synths } from 'constants/currency';
import Currency from 'components/Currency';
import Table from 'components/Table';
import { isL2State } from 'store/wallet';
import TimeDisplay from '../../futures/Trades/TimeDisplay';
import { NO_VALUE } from 'constants/placeholder';
import { GridDivCenteredRow } from 'styles/common';
import useGetAllFuturesTradesForAccount from 'queries/futures/useGetAllFuturesTradesForAccount';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { FuturesTrade } from 'queries/futures/types';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { formatCryptoCurrency, formatCurrency } from 'utils/formatters/number';
import { ETH_UNIT } from 'constants/network';
import { TradeStatus } from 'sections/futures/types';
import PositionType from 'components/Text/PositionType';
import { futuresAccountState } from 'store/futures';

const FuturesHistoryTable: FC = () => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
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
			trades.map((trade: FuturesTrade) => {
				return {
					...trade,
					price: Number(trade?.price?.div(ETH_UNIT)),
					size: Number(trade?.size.div(ETH_UNIT).abs()),
					timestamp: Number(trade?.timestamp.mul(1000)),
					pnl: trade?.pnl.div(ETH_UNIT),
					feesPaid: trade?.feesPaid.div(ETH_UNIT),
					id: trade?.txnHash,
					orderType: trade?.orderType === 'NextPrice' ? 'Next Price' : trade?.orderType,
					status: trade?.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
				};
			}),
		[trades]
	);

	const conditionalRender = <T,>(prop: T, children: ReactElement): ReactElement =>
		_.isNil(prop) ? <DefaultCell>{NO_VALUE}</DefaultCell> : children;
	return (
		<TableContainer>
			<StyledTable
				data={isL2 ? mappedHistoricalTrades : []}
				showPagination={true}
				isLoading={futuresTradesQuery.isLoading}
				noResultsMessage={
					!isL2 ? (
						<TableNoResults>
							{t('dashboard.overview.futures-history-table.no-results')}
							<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
						</TableNoResults>
					) : (
						<TableNoResults>
							{t('dashboard.overview.futures-history-table.no-trade-history')}
							<Link href={ROUTES.Markets.Home}>
								<div>{t('dashboard.overview.futures-history-table.no-trade-history-link')}</div>
							</Link>
						</TableNoResults>
					)
				}
				highlightRowsOnHover
				sortBy={[{ id: 'dateTime', asec: true }]}
				columns={[
					{
						Header: (
							<TableHeader>{t('dashboard.overview.futures-history-table.date-time')}</TableHeader>
						),
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
						Header: (
							<TableHeader>{t('dashboard.overview.futures-history-table.market')}</TableHeader>
						),
						accessor: 'market',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							const asset = `${ethersUtils.parseBytes32String(cellProps.row.original.asset)}`;
							return conditionalRender(
								asset,
								<SynthContainer>
									{asset && (
										<>
											<IconContainer>
												<StyledCurrencyIcon currencyKey={(asset[0] !== 's' ? 's' : '') + asset} />
											</IconContainer>
											<StyledText>
												{(asset[0] === 's' ? asset.slice(1) : asset) + '-PERP'}
											</StyledText>
										</>
									)}
								</SynthContainer>
							);
						},
						width: 120,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-history-table.side')}</TableHeader>,
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
						Header: <TableHeader>{t('dashboard.overview.futures-history-table.size')}</TableHeader>,
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
						Header: (
							<TableHeader>{t('dashboard.overview.futures-history-table.price')}</TableHeader>
						),
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
						Header: <TableHeader>{t('dashboard.overview.futures-history-table.pnl')}</TableHeader>,
						accessor: 'pnl',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							return conditionalRender(
								cellProps.row.original.pnl,
								cellProps.row.original.pnl.eq(wei(0)) ? (
									<PNL normal={true}>--</PNL>
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
						Header: <TableHeader>{t('dashboard.overview.futures-history-table.fees')}</TableHeader>,
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
						Header: (
							<TableHeader>{t('dashboard.overview.futures-history-table.order-type')}</TableHeader>
						),
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
const DefaultCell = styled.p``;
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
const TableHeader = styled.div``;
const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
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
			? props.theme.colors.selectedTheme.button.text
			: props.negative
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.green};
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 20px;
	font-family: ${(props) => props.theme.fonts.bold};
	div {
		text-decoration: underline;
		cursor: pointer;
		font-size: 16px;
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

export default FuturesHistoryTable;
