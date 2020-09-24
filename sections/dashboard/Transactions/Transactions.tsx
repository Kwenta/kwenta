import { useState, useMemo } from 'react';
import styled from 'styled-components';
import synthetix from 'lib/synthetix';
import { useTranslation } from 'react-i18next';

import useAllTradesQuery from 'queries/trades/useAllTradesQuery';

import { CATEGORY_MAP } from 'constants/currency';

import Select from 'components/Select';

import { FlexDivRow, CapitalizedText } from 'styles/common';

import TradeHistory from './TradeHistory';

const Transactions = () => {
	const { t } = useTranslation();
	const allTradesQuery = useAllTradesQuery();

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

	const orderSizeList = [{ label: 'All Sizes', key: 'ALL_ORDER_SIZES' }];
	const [orderSize, setOrderSize] = useState(orderSizeList[0]);

	const synths = synthetix.js?.synths || [];
	const filteredSynthKeys = useMemo(
		() => synths.filter((synth) => synth.category === synthFilter.key).map((synth) => synth.name),
		[synths, synthFilter.key]
	);

	const trades = allTradesQuery.data || [];
	const filteredHistoricalTrades = useMemo(
		() =>
			synthFilter.key !== 'ALL_SYNTHS'
				? trades.filter((trade) => filteredSynthKeys.indexOf(trade.fromCurrencyKey) !== -1)
				: trades,
		[trades, filteredSynthKeys, synthFilter.key]
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
					isLoaded={allTradesQuery.isSuccess}
					isLoading={allTradesQuery.isLoading}
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
