import { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import synthetix from 'lib/synthetix';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { CATEGORY_MAP } from 'constants/currency';

import Select from 'components/Select';

import { FlexDivRow, CapitalizedText } from 'styles/common';

import TradeHistory from './TradeHistory';
import { useWalletTradesQuery } from 'queries/trades/useWalletTradesQuery';
import { walletAddressState } from 'store/wallet';
import { HistoricalTrade } from 'queries/trades/types';
import { Synth } from '@synthetixio/js';

const Transactions = () => {
	const { t } = useTranslation();
	const walletAddress = useRecoilValue(walletAddressState);
	const walletTradesQuery = useWalletTradesQuery({ walletAddress: walletAddress || '' });

	const synthFilterList = [
		{ label: t('dashboard.transactions.synthSort.allSynths'), key: 'ALL_SYNTHS' },
		{ label: t('common.currency-category.crypto'), key: CATEGORY_MAP['crypto'] },
		{ label: t('common.currency-category.forex'), key: CATEGORY_MAP['forex'] },
		{ label: t('common.currency-category.commodity'), key: CATEGORY_MAP['commodity'] },
		{ label: t('common.currency-category.equities'), key: CATEGORY_MAP['equities'] },
	];
	const [synthFilter, setSynthFilter] = useState(synthFilterList[0]);
	const orderTypeList = [
		{ label: t('dashboard.transactions.orderTypeSort.allOrderTypes'), key: 'ALL_ORDER_TYPES' },
		{ label: t('dashboard.transactions.orderTypeSort.market'), key: 'MARKET' },
		/* { label: t('dashboard.transactions.orderTypeSort.limit'), key: 'LIMIT' }, */
	];
	const [orderType, setOrderType] = useState(orderTypeList[0]);

	const orderSizeList = [
		{ label: 'All Sizes', key: 'ALL_ORDER_SIZES' },
		{ label: '< 1000', key: 'LTET1000' },
		{ label: '1000 < x < 10,000', key: 'GT1000LTET10000' },
		{ label: '10,000 < x < 100,000', key: 'GT10000LTET100000' },
		{ label: '100,000+', key: 'GT100000' },
	];
	const [orderSize, setOrderSize] = useState(orderSizeList[0]);

	const synths = synthetix.js?.synths || [];

	const createSynthTypeFilter = useCallback(
		(synths: Synth[], synthFilter: string) => (trade: HistoricalTrade) =>
			synths
				.filter((synth) => synth.category === synthFilter || synthFilter === 'ALL_SYNTHS')
				.map((synth) => synth.name)
				.indexOf(trade.fromCurrencyKey) !== -1,
		[]
	);

	// This will always return true until we add limit orders back in.
	const createOrderTypeFilter = useCallback(
		(orderType: string) => (trade: HistoricalTrade) => true,
		[]
	);

	const createOrderSizeFilter = useCallback(
		(orderSize: string) => (trade: HistoricalTrade) => {
			switch (orderSize) {
				case orderSizeList[1].key:
					return trade.fromAmount <= 1000;
				case orderSizeList[2].key:
					return 1000 < trade.fromAmount && trade.fromAmount <= 10000;
				case orderSizeList[3].key:
					return 10000 < trade.fromAmount && trade.fromAmount <= 100000;
				case orderSizeList[4].key:
					return trade.fromAmount >= 100000;
				default:
					return true;
			}
		},
		[orderSizeList]
	);

	const trades = walletTradesQuery.data || [];
	const filteredHistoricalTrades = useMemo(
		() =>
			trades
				.filter(createSynthTypeFilter(synths, synthFilter.key))
				.filter(createOrderTypeFilter(orderType.key))
				.filter(createOrderSizeFilter(orderSize.key)),
		[
			trades,
			orderSize.key,
			orderType.key,
			synthFilter.key,
			synths,
			createSynthTypeFilter,
			createOrderTypeFilter,
			createOrderSizeFilter,
		]
	);

	return (
		<>
			<FlexDivRow>
				<TransactionSelect
					formatOptionLabel={(option: any) => <CapitalizedText>{option.label}</CapitalizedText>}
					options={synthFilterList}
					value={synthFilter}
					onChange={(option: any) => {
						if (option) {
							setSynthFilter(option);
						}
					}}
				/>
				<TransactionSelect
					formatOptionLabel={(option: any) => <CapitalizedText>{option.label}</CapitalizedText>}
					options={orderTypeList}
					value={orderType}
					onChange={(option: any) => {
						if (option) {
							setOrderType(option);
						}
					}}
				/>
				<TransactionSelect
					formatOptionLabel={(option: any) => <CapitalizedText>{option.label}</CapitalizedText>}
					options={orderSizeList}
					value={orderSize}
					onChange={(option: any) => {
						if (option) {
							setOrderSize(option);
						}
					}}
				/>
			</FlexDivRow>
			<TradeHistoryContainer>
				<TradeHistory
					trades={filteredHistoricalTrades}
					isLoaded={walletTradesQuery.isSuccess}
					isLoading={walletTradesQuery.isLoading}
				/>
			</TradeHistoryContainer>
		</>
	);
};

const TransactionSelect = styled(Select)`
	width: 33%;
	max-width: 217px;
`;

const TradeHistoryContainer = styled.div`
	overflow: auto;
`;

export default Transactions;
