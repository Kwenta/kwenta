import { SynthExchangeResult } from '@synthetixio/queries';
import Link from 'next/link';
import { FC, useMemo, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import LinkIcon from 'assets/svg/app/link.svg';
import Currency from 'components/Currency';
import Table, { TableNoResults } from 'components/Table';
import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import { blockExplorer } from 'containers/Connector/Connector';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useGetWalletTrades from 'queries/synths/useGetWalletTrades';
import { ExternalLink } from 'styles/common';

import TimeDisplay from '../../futures/Trades/TimeDisplay';

interface SynthTradesExchangeResult extends SynthExchangeResult {
	hash: string;
}

type WalletTradesExchangeResult = Omit<SynthTradesExchangeResult, 'timestamp'> & {
	timestamp: number;
};

const conditionalRender = <T,>(prop: T, children: ReactElement) =>
	!prop ? <p>{NO_VALUE}</p> : children;

const SpotHistoryTable: FC = () => {
	const { t } = useTranslation();
	const { network, walletAddress, synthsMap } = Connector.useContainer();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const walletTradesQuery = useGetWalletTrades(walletAddress!);

	const synths = useMemo(() => Object.values(synthsMap) || [], [synthsMap]);
	const trades = useMemo(() => {
		const t = walletTradesQuery.data?.synthExchanges ?? [];

		return t.map((trade: any) => ({ ...trade, hash: trade.id.split('-')[0] }));
	}, [walletTradesQuery.data]);

	const filteredHistoricalTrades = useMemo(
		() =>
			trades.filter((trade: any) => {
				const activeSynths = synths.map((synth) => synth.name);
				return activeSynths.includes(trade.fromSynth?.symbol as CurrencyKey);
			}),
		[trades, synths]
	);

	return (
		<TableContainer>
			<StyledTable
				data={filteredHistoricalTrades}
				showPagination
				isLoading={walletTradesQuery.isLoading}
				highlightRowsOnHover
				noResultsMessage={
					<TableNoResults>
						{t('dashboard.history.spot-history-table.no-trade-history')}
						<Link href={ROUTES.Exchange.Home}>
							<div>{t('dashboard.history.spot-history-table.no-trade-history-link')}</div>
						</Link>
					</TableNoResults>
				}
				sortBy={[{ id: 'dateTime', asec: true }]}
				columns={[
					{
						Header: <div>{t('dashboard.history.spot-history-table.date-time')}</div>,
						accessor: 'dateTime',
						Cell: (cellProps: CellProps<WalletTradesExchangeResult>) => {
							return conditionalRender(
								cellProps.row.original.timestamp,
								<StyledTimeDisplay>
									<TimeDisplay value={cellProps.row.original.timestamp * 1000} />
								</StyledTimeDisplay>
							);
						},
						width: 190,
					},
					{
						Header: <div>{t('dashboard.history.spot-history-table.from')}</div>,
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
											currencyKey="sUSD"
											amount={cellProps.row.original.fromAmount}
											totalValue={0}
											conversionRate={selectPriceCurrencyRate}
											showTotalValue={false}
										/>
									</StyledText>
								</SynthContainer>
							);
						},
						width: 190,
					},
					{
						Header: <div>{t('dashboard.history.spot-history-table.to')}</div>,
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
											currencyKey="sUSD"
											amount={cellProps.row.original.toAmount}
											totalValue={0}
											conversionRate={selectPriceCurrencyRate}
											showTotalValue={false}
										/>
									</StyledText>
								</SynthContainer>
							);
						},
						width: 190,
					},
					{
						Header: <div>{t('dashboard.history.spot-history-table.usd-value')}</div>,
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
									formatOptions={{
										currencyKey: undefined,
										sign: selectedPriceCurrency.sign,
									}}
								/>
							);
						},
						width: 190,
					},
					{
						id: 'link',
						Cell: (cellProps: CellProps<WalletTradesExchangeResult>) =>
							network != null && cellProps.row.original.hash ? (
								<StyledExternalLink href={`${blockExplorer.txLink(cellProps.row.original.hash)}`}>
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
