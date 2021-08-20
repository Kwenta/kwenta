import { FC, useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CATEGORY_MAP } from 'constants/currency';
import useSynthetixQueries from '@synthetixio/queries';
import { Synth } from '@synthetixio/contracts-interface';
import { SynthExchangeExpanded } from '@synthetixio/data/build/node/src/types';
import { useRecoilValue } from 'recoil';

import Select from 'components/Select';
import { walletAddressState } from 'store/wallet';
import { CapitalizedText, GridDiv } from 'styles/common';
import Connector from 'containers/Connector';

import TradeHistory from './TradeHistory';

const Transactions: FC = () => {
	const { t } = useTranslation();
	const { synthetixjs } = Connector.useContainer();
	const walletAddress = useRecoilValue(walletAddressState);
	const { useWalletTradesQuery } = useSynthetixQueries();
	const walletTradesQuery = useWalletTradesQuery(walletAddress ?? '');

	const synthFilterList = useMemo(
		() => [
			{ label: t('dashboard.transactions.synth-sort.allSynths'), key: 'ALL_SYNTHS' },
			{ label: t('common.currency-category.crypto'), key: CATEGORY_MAP['crypto'] },
			{ label: t('common.currency-category.forex'), key: CATEGORY_MAP['forex'] },
			{ label: t('common.currency-category.commodity'), key: CATEGORY_MAP['commodity'] },
			{ label: t('common.currency-category.equities'), key: CATEGORY_MAP['equities'] },
		],
		[t]
	);
	const orderTypeList = useMemo(
		() => [
			{
				label: t('dashboard.transactions.order-type-sort.allOrderTypes'),
				key: 'ALL_ORDER_TYPES',
			},
			{ label: t('dashboard.transactions.order-type-sort.market'), key: 'MARKET' },
			/* { label: t('dashboard.transactions.order-type-sort.limit'), key: 'LIMIT' }, */
		],
		[t]
	);
	const orderSizeList = useMemo(
		() => [
			{ label: 'All Sizes', key: 'ALL_ORDER_SIZES' },
			{ label: '< 1000', key: 'LTET1000' },
			{ label: '1000 < x < 10,000', key: 'GT1000LTET10000' },
			{ label: '10,000 < x < 100,000', key: 'GT10000LTET100000' },
			{ label: '100,000+', key: 'GT100000' },
		],
		[]
	);
	const [synthFilter, setSynthFilter] = useState(synthFilterList[0]);
	const [orderType, setOrderType] = useState(orderTypeList[0]);
	const [orderSize, setOrderSize] = useState(orderSizeList[0]);

	const synths = useMemo(() => synthetixjs!.synths || [], [synthetixjs]);

	const createSynthTypeFilter = useCallback(
		(synths: Synth[], synthFilter: string) => (trade: SynthExchangeExpanded) =>
			synths
				.filter((synth) => synth.category === synthFilter || synthFilter === 'ALL_SYNTHS')
				.map((synth) => synth.name)
				.indexOf(trade.fromCurrencyKey) !== -1,
		[]
	);

	// This will always return true until we add limit orders back in.
	const createOrderTypeFilter = useCallback(
		(orderType: string) => (trade: SynthExchangeExpanded) => true,
		[]
	);

	const createOrderSizeFilter = useCallback(
		(orderSize: string) => (trade: SynthExchangeExpanded) => {
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

	const trades = useMemo(() => {
		const t = walletTradesQuery.data || [];

		//TODO: move to parsing library
		return t.map((trade) => ({
			...trade,
			hash: trade.id.split('-')[0],
		}));
	}, [walletTradesQuery.data]);
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
			<Filters>
				<Select
					inputId="synth-filter-list"
					formatOptionLabel={(option: any) => <CapitalizedText>{option.label}</CapitalizedText>}
					options={synthFilterList}
					value={synthFilter}
					onChange={(option: any) => {
						if (option) {
							setSynthFilter(option);
						}
					}}
				/>
				<Select
					inputId="order-type-list"
					formatOptionLabel={(option: any) => <CapitalizedText>{option.label}</CapitalizedText>}
					options={orderTypeList}
					value={orderType}
					onChange={(option: any) => {
						if (option) {
							setOrderType(option);
						}
					}}
				/>
				<Select
					inputId="order-size-list"
					formatOptionLabel={(option: any) => <CapitalizedText>{option.label}</CapitalizedText>}
					options={orderSizeList}
					value={orderSize}
					onChange={(option: any) => {
						if (option) {
							setOrderSize(option);
						}
					}}
				/>
			</Filters>
			<TradeHistory
				trades={filteredHistoricalTrades}
				isLoaded={walletTradesQuery.isSuccess}
				isLoading={walletTradesQuery.isLoading}
			/>
		</>
	);
};

const Filters = styled(GridDiv)`
	grid-template-columns: repeat(3, 1fr);
	grid-gap: 18px;
`;

export default Transactions;
