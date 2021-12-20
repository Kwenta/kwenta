import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import Currency from 'components/Currency';

import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';

import { SelectableCurrencyRow } from 'styles/common';
import useMarketClosed from 'hooks/useMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useSynthetixQueries from '@synthetixio/queries';
import { Synth } from '@synthetixio/contracts-interface';

import { CurrencyKey, Synths } from '@synthetixio/contracts-interface';

type SynthRowProps = {
	price: number | null;
	synth: Synth;
};

const SynthRow: FC<SynthRowProps> = ({ price, synth }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const currencyKey = synth.name as CurrencyKey;

	let priceChange = 0;

	if (currencyKey !== Synths.sUSD) {
		const synthCandle = useSynthetixQueries().subgraph.useGetDailyCandles(
			{
				first: 1,
				where: {
					synth: synth.name,
				},
				orderBy: 'timestamp',
				orderDirection: 'desc',
			},
			{
				open: true,
				close: true,
			}
		);
		if (synthCandle.isSuccess && synthCandle.data?.length) {
			const [candle] = synthCandle.data;
			priceChange = candle?.open.sub(candle.close).div(candle.open).toNumber();
		}
	}
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
					currencyKey={selectedPriceCurrency.name}
					price={price}
					sign={selectedPriceCurrency.sign}
					conversionRate={selectPriceCurrencyRate}
					change={priceChange}
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
