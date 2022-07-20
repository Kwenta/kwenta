import { CurrencyKey } from '@synthetixio/contracts-interface';
import { SynthExchangeResult } from '@synthetixio/queries/build/node/generated/mainSubgraphQueries';
import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import LinkIcon from 'assets/svg/app/link.svg';
import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import Currency from 'components/Currency';
import Table from 'components/Table';
import { NO_VALUE } from 'constants/placeholder';
import BlockExplorer from 'containers/BlockExplorer';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { isL2State } from 'store/wallet';
import { ExternalLink, GridDivCenteredRow, NoTextTransform } from 'styles/common';
import { formatCurrency } from 'utils/formatters/number';

import SynthFeeReclaimStatus from './SynthFeeReclaimStatus';
import TxReclaimFee from './TxReclaimFee';

export interface SynthTradesExchangeResult extends SynthExchangeResult {
	hash: string;
}

type TradeHistoryProps = {
	trades: SynthTradesExchangeResult[];
	isLoading: boolean;
	isLoaded: boolean;
};

const TradeHistory: FC<TradeHistoryProps> = ({ trades, isLoading, isLoaded }) => {
	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);

	const { blockExplorerInstance } = BlockExplorer.useContainer();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const columnsDeps = useMemo(() => [selectPriceCurrencyRate], [selectPriceCurrencyRate]);
	return (
		<StyledTable
			palette="primary"
			columns={[
				{
					Header: (
						<StyledTableHeader>{t('dashboard.transactions.table.orderType')}</StyledTableHeader>
					),
					accessor: 'orderType',
					Cell: (cellProps: CellProps<SynthTradesExchangeResult>) => (
						<StyledOrderType>
							{t('dashboard.transactions.order-type-sort.market')}
							<SynthFeeReclaimStatus trade={cellProps.row.original} />
						</StyledOrderType>
					),
					sortable: true,
					width: 125,
				},
				{
					Header: <StyledTableHeader>{t('dashboard.transactions.table.from')}</StyledTableHeader>,
					accessor: 'fromAmount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<SynthTradesExchangeResult>) => (
						<span>
							<StyledCurrencyKey>{cellProps.row.original.fromSynth?.symbol}</StyledCurrencyKey>
							<StyledPrice>
								{formatCurrency(
									cellProps.row.original.fromSynth?.symbol || '',
									cellProps.row.original.fromAmount
								)}
							</StyledPrice>
						</span>
					),
					width: 175,
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('dashboard.transactions.table.to')}</StyledTableHeader>,
					accessor: 'toAmount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<SynthTradesExchangeResult>) => (
						<span>
							<StyledCurrencyKey>{cellProps.row.original.toSynth?.symbol}</StyledCurrencyKey>
							<StyledPrice>
								{formatCurrency(
									cellProps.row.original.toSynth?.symbol || '',
									cellProps.row.original.toAmount
								)}
							</StyledPrice>
						</span>
					),
					width: 175,
					sortable: true,
				},
				{
					Header: (
						<StyledTableHeader>
							<Trans
								i18nKey="common.currency.currency-value"
								values={{ currencyKey: selectedPriceCurrency.asset }}
								components={[<NoTextTransform />]}
							/>
						</StyledTableHeader>
					),
					accessor: 'amount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<SynthTradesExchangeResult>) => (
						<Currency.Price
							currencyKey={cellProps.row.original.toSynth?.symbol as CurrencyKey}
							price={cellProps.row.original.toAmountInUSD}
							sign={selectedPriceCurrency.sign}
							conversionRate={selectPriceCurrencyRate}
						/>
					),
					width: 175,
					sortable: true,
				},
				{
					Header: (
						<StyledTableHeader>{t('dashboard.transactions.table.fee-reclaim')}</StyledTableHeader>
					),
					accessor: 'timestamp',
					sortType: 'basic',
					Cell: (cellProps: CellProps<SynthTradesExchangeResult>) => (
						<TxReclaimFee trade={cellProps.row.original} />
					),
					width: 175,
					sortable: true,
				},
				{
					id: 'link',
					Cell: (cellProps: CellProps<SynthTradesExchangeResult>) =>
						blockExplorerInstance != null && cellProps.row.original.hash ? (
							<StyledExternalLink href={blockExplorerInstance.txLink(cellProps.row.original.hash)}>
								<StyledLinkIcon />
							</StyledExternalLink>
						) : (
							NO_VALUE
						),
					width: 50,
					sortable: false,
				},
			]}
			columnsDeps={columnsDeps}
			data={trades}
			hiddenColumns={isL2 ? ['timestamp'] : []}
			isLoading={isLoading && !isLoaded}
			noResultsMessage={
				isLoaded && trades.length === 0 ? (
					<TableNoResults>
						<NoNotificationIcon />
						{t('dashboard.transactions.table.no-results')}
					</TableNoResults>
				) : undefined
			}
			showPagination
		/>
	);
};

const StyledExternalLink = styled(ExternalLink)`
	margin-left: auto;
`;

const StyledLinkIcon = styled(LinkIcon)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
`;

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
`;

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	display: flex;
	align-items: center;
`;

const StyledCurrencyKey = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	padding-right: 10px;
`;

const StyledPrice = styled.span`
	color: ${(props) => props.theme.colors.silver};
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.elderberry};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

export default TradeHistory;
