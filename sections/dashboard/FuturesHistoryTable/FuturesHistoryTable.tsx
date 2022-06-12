import { FC, useMemo, ReactElement } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { CurrencyKey, Synths } from 'constants/currency';
import Connector from 'containers/Connector';
import values from 'lodash/values';
import Currency from 'components/Currency';
import { CellProps } from 'react-table';
import Table from 'components/Table';
import { isL2State, walletAddressState } from 'store/wallet';
import TimeDisplay from '../../futures/Trades/TimeDisplay';
import { NO_VALUE } from 'constants/placeholder';
import { ExternalLink } from 'styles/common';
import LinkIcon from 'assets/svg/app/link.svg';
import * as _ from 'lodash/fp';
import useGetAllFuturesTradesForAccount from '../../../queries/futures/useGetAllFuturesTradesForAccount';
import { utils as ethersUtils } from 'ethers';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { FuturesTrade, PositionSide } from 'queries/futures/types';

const FuturesHistoryTable: FC = () => {
	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const futuresTradesQuery = useGetAllFuturesTradesForAccount(walletAddress);
	const trades: FuturesTrade[] = useMemo(
		() => (futuresTradesQuery.isSuccess ? futuresTradesQuery?.data ?? [] : []),
		[futuresTradesQuery.isSuccess, futuresTradesQuery.data]
	);
	const { synthsMap } = Connector.useContainer();
	const synths = useMemo(() => values(synthsMap) || [], [synthsMap]);
	const filteredHistoricalTrades = useMemo(
		() =>
			trades.filter((trade: any) => {
				const activeSynths = synths.map((synth) => ethersUtils.formatBytes32String(synth.name));
				return activeSynths.includes(trade.asset as CurrencyKey);
			}),
		[trades, synths]
	);
	const conditionalRender = <T,>(prop: T, children: ReactElement): ReactElement =>
		_.isNil(prop) ? <DefaultCell>{NO_VALUE}</DefaultCell> : children;
	return (
		<TableContainer>
			<StyledTable
				data={filteredHistoricalTrades}
				showPagination={true}
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
									<TimeDisplay
										cellPropsValue={cellProps.row.original.timestamp.toNumber() * 1000}
									/>
								</StyledTimeDisplay>
							);
						},
						width: 120,
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
												<StyledCurrencyIcon currencyKey={asset} />
											</IconContainer>
											<StyledText>{asset}</StyledText>
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
								<PositionValue side={cellProps.row.original.side!}>
									{cellProps.row.original.side}
								</PositionValue>
							);
						},
						width: 120,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-history-table.size')}</TableHeader>,
						accessor: 'size',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							return conditionalRender(
								cellProps.row.original.size,
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.size}
									sign={selectedPriceCurrency.sign}
									conversionRate={selectPriceCurrencyRate}
								/>
							);
						},
						width: 250,
					},
					{
						Header: (
							<TableHeader>{t('dashboard.overview.futures-history-table.price')}</TableHeader>
						),
						accessor: 'price',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							return conditionalRender(
								cellProps.row.original.price,
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.price!}
									sign={selectedPriceCurrency.sign}
									conversionRate={selectPriceCurrencyRate}
								/>
							);
						},
						width: 300,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.futures-history-table.pnl')}</TableHeader>,
						accessor: 'pnl',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							return conditionalRender(
								cellProps.row.original.pnl,
								<Currency.Price
									currencyKey={Synths.sUSD}
									price={cellProps.row.original.pnl}
									sign={selectedPriceCurrency.sign}
									conversionRate={selectPriceCurrencyRate}
								/>
							);
						},
						width: 250,
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
						width: 250,
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
const StyledExternalLink = styled(ExternalLink)`
	margin-left: auto;
`;
const StyledTimeDisplay = styled.div`
	div {
		margin-left: 2px;
	}
`;
const StyledLinkIcon = styled(LinkIcon)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	&:hover {
		color: ${(props) => props.theme.colors.goldColors.color1};
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
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;
const SynthContainer = styled.div`
	display: flex;
	align-items: center;
	grid-column: 3;
	grid-row: 1;
	column-gap: 5px;
	margin-left: -4px;
`;

const PositionValue = styled.span<{ side?: PositionSide }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 13px;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	margin: 0;

	${(props) =>
		props.side === PositionSide.LONG &&
		css`
			color: ${props.theme.colors.selectedTheme.green};
		`}

	${(props) =>
		props.side === PositionSide.SHORT &&
		css`
			color: ${props.theme.colors.selectedTheme.red};
		`}
`;
export default FuturesHistoryTable;
