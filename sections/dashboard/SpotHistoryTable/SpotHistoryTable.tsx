import { FC, useMemo, ReactElement } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { Synths } from '@synthetixio/contracts-interface';
import { CurrencyKey } from 'constants/currency';
import Connector from 'containers/Connector';
import values from 'lodash/values';
import Currency from 'components/Currency';
import { CellProps } from 'react-table';
import Table from 'components/Table';
import { walletAddressState } from 'store/wallet';
import { SynthTradesExchangeResult } from '../Transactions/TradeHistory/TradeHistory';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import TimeDisplay from '../../futures/Trades/TimeDisplay';
import { NO_VALUE } from 'constants/placeholder';
import BlockExplorer from 'containers/BlockExplorer';
import { ExternalLink } from 'styles/common';
import LinkIcon from 'assets/svg/app/link.svg';
import * as _ from 'lodash/fp';
import { isFiatCurrency } from 'utils/currencies';
import useGetWalletTrades from 'queries/synths/useGetWalletTrades';

type WalletTradesExchangeResult = Omit<SynthTradesExchangeResult, 'timestamp'> & {
	timestamp: number;
};

const SpotHistoryTable: FC = () => {
	const { t } = useTranslation();
	const walletAddress = useRecoilValue(walletAddressState);

	const { blockExplorerInstance } = BlockExplorer.useContainer();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const walletTradesQuery = useGetWalletTrades(walletAddress!);
	const { synthsMap } = Connector.useContainer();

	const synths = useMemo(() => values(synthsMap) || [], [synthsMap]);
	const trades = useMemo(() => {
		const t = walletTradesQuery.data?.synthExchanges ?? [];

		return t.map((trade: any) => ({
			...trade,
			hash: trade.id.split('-')[0],
		}));
	}, [walletTradesQuery.data]);

	const filteredHistoricalTrades = useMemo(
		() =>
			trades.filter((trade: any) => {
				const activeSynths = synths.map((synth) => synth.name);
				return activeSynths.includes(trade.fromSynth?.symbol as CurrencyKey);
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
				sortBy={[
					{
						id: 'dateTime',
						asec: true,
					},
				]}
				columns={[
					{
						Header: <TableHeader>{t('dashboard.overview.history-table.date-time')}</TableHeader>,
						accessor: 'dateTime',
						Cell: (cellProps: CellProps<WalletTradesExchangeResult>) => {
							return conditionalRender(
								cellProps.row.original.timestamp,
								<StyledTimeDisplay>
									<TimeDisplay cellPropsValue={cellProps.row.original.timestamp * 1000} />
								</StyledTimeDisplay>
							);
						},
						width: 190,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.history-table.from')}</TableHeader>,
						accessor: 'fromAmount',
						Cell: (cellProps: CellProps<WalletTradesExchangeResult>) => {
							return conditionalRender(
								cellProps.row.original.fromSynth && cellProps.row.original.fromAmount,
								<SynthContainer>
									{cellProps.row.original.fromSynth?.symbol && (
										<>
											<IconContainer>
												<StyledCurrencyIcon currencyKey={cellProps.row.original.fromSynth.symbol} />
											</IconContainer>
											<StyledText>{cellProps.row.original.fromSynth.symbol}</StyledText>
										</>
									)}

									<StyledText>
										<Currency.Amount
											currencyKey={Synths.sUSD}
											amount={cellProps.row.original.fromAmount}
											totalValue={0}
											conversionRate={selectPriceCurrencyRate}
											showTotalValue={false}
										></Currency.Amount>
									</StyledText>
								</SynthContainer>
							);
						},
						width: 190,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.history-table.to')}</TableHeader>,
						accessor: 'toAmount',
						Cell: (cellProps: CellProps<WalletTradesExchangeResult>) => {
							return conditionalRender(
								cellProps.row.original.toSynth && cellProps.row.original.toAmount,
								<SynthContainer>
									{cellProps.row.original.toSynth?.symbol && (
										<>
											<IconContainer>
												<StyledCurrencyIcon currencyKey={cellProps.row.original.toSynth.symbol} />
											</IconContainer>
											<StyledText>{cellProps.row.original.toSynth.symbol}</StyledText>
										</>
									)}

									<StyledText>
										<Currency.Amount
											currencyKey={Synths.sUSD}
											amount={cellProps.row.original.toAmount}
											totalValue={0}
											conversionRate={selectPriceCurrencyRate}
											showTotalValue={false}
										></Currency.Amount>
									</StyledText>
								</SynthContainer>
							);
						},
						width: 190,
					},
					{
						Header: <TableHeader>{t('dashboard.overview.history-table.usd-value')}</TableHeader>,
						accessor: 'amount',
						Cell: (cellProps: CellProps<WalletTradesExchangeResult>) => {
							const currencyKey = cellProps.row.original.toSynth?.symbol as CurrencyKey;
							return conditionalRender(
								currencyKey,
								<Currency.Price
									currencyKey={currencyKey}
									price={cellProps.row.original.toAmountInUSD}
									sign={selectedPriceCurrency.sign}
									conversionRate={selectPriceCurrencyRate}
									formatOptions={
										isFiatCurrency(currencyKey)
											? {
													currencyKey: undefined,
													sign: selectedPriceCurrency.sign,
											  }
											: {
													currencyKey: selectedPriceCurrency.sign,
													sign: undefined,
											  }
									}
								/>
							);
						},
						width: 190,
					},
					{
						id: 'link',
						Cell: (cellProps: CellProps<WalletTradesExchangeResult>) =>
							blockExplorerInstance != null && cellProps.row.original.hash ? (
								<StyledExternalLink
									href={blockExplorerInstance.txLink(cellProps.row.original.hash)}
								>
									<StyledLinkIcon />
								</StyledExternalLink>
							) : (
								NO_VALUE
							),
						width: 50,
						sortable: false,
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

export default SpotHistoryTable;
