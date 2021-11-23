import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import Currency from 'components/Currency';

import { NO_VALUE } from 'constants/placeholder';
import { PERIOD_IN_HOURS, Period } from 'constants/period';
import ROUTES from 'constants/routes';

import { SelectableCurrencyRow } from 'styles/common';
import useMarketClosed from 'hooks/useMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useSynthetixQueries from '@synthetixio/queries';
import { Synth } from '@synthetixio/contracts-interface';
import {
	// CurrencyKey,
	sUSD_EXCHANGE_RATE,
} from 'constants/currency';

import { CurrencyKey, Synths } from '@synthetixio/contracts-interface';

import { getMinAndMaxRate, usdHistoricalRates } from './utils';

import { ethers } from 'ethers';
import { calculateTimestampForPeriod } from 'utils/formatters/date';

type SynthRowProps = {
	price: number | null;
	synth: Synth;
};

const SynthRow: FC<SynthRowProps> = ({ price, synth }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const twentyFourHoursAgo = useMemo(
		() => calculateTimestampForPeriod(PERIOD_IN_HOURS.ONE_DAY),
		[]
	);

	const currencyKey = synth.name as CurrencyKey;

	const { exchanges } = useSynthetixQueries();
	const periodInHours = PERIOD_IN_HOURS[Period.ONE_DAY];
	let historicalRates = {};

	if (currencyKey === Synths.sUSD) {
		historicalRates = {
			rates: usdHistoricalRates(periodInHours, sUSD_EXCHANGE_RATE.toNumber()),
			low: sUSD_EXCHANGE_RATE,
			high: sUSD_EXCHANGE_RATE,
			change: 0,
		};
	} else {
		// https://github.com/Synthetixio/js-monorepo/blob/1ec49781f371e60c2cf8928459aaa4c602089c2d/packages/queries/src/queries/rates/useHistoricalRatesQuery.ts
		let historicalRatesQuery = exchanges.useGetRateUpdates(
			{
				first: Number.MAX_SAFE_INTEGER,
				where: {
					timestamp_gte: twentyFourHoursAgo,
					synth: ethers.utils.formatBytes32String(currencyKey),
				},
			},
			{
				id: true,
				currencyKey: true,
				synth: true,
				rate: true,
				block: true,
				timestamp: true,
			}
		);
		historicalRates = getMinAndMaxRate(historicalRatesQuery.data ?? []);
	}
	// return <div>hi</div>;
	// const historicalRates = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY, {
	// 	refetchInterval: false,
	// });
	const { marketClosureReason } = useMarketClosed(currencyKey);

	return (
		<StyledSelectableCurrencyRow
			isSelectable={true}
			onClick={() => router.push(ROUTES.Exchange.Into(currencyKey))}
		>
			<Currency.Name
				currencyKey={currencyKey}
				name={
					synth.description
						? t('common.currency.synthetic-currency-name', {
								currencyName: synth.description,
						  })
						: ''
				}
				showIcon={true}
				marketClosureReason={marketClosureReason}
			/>
			{price != null ? (
				<Currency.Price
					currencyKey={selectedPriceCurrency.name as CurrencyKey}
					price={price}
					sign={selectedPriceCurrency.sign}
					conversionRate={selectPriceCurrencyRate}
					change={historicalRates.data?.change}
				/>
			) : (
				NO_VALUE
			)}
		</StyledSelectableCurrencyRow>
	);
};

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding-left: 32px;
	padding-right: 32px;
	padding-bottom: 13px;
`;

export default SynthRow;
