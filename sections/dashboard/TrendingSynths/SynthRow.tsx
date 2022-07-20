import { Synth } from '@synthetixio/contracts-interface';
import { CurrencyKey, Synths } from '@synthetixio/contracts-interface';
import useSynthetixQueries from '@synthetixio/queries';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import useMarketClosed from 'hooks/useMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { networkState } from 'store/wallet';
import { SelectableCurrencyRow } from 'styles/common';

type SynthRowProps = {
	price: number | null;
	synth: Synth;
};

const SynthRow: FC<SynthRowProps> = ({ price, synth }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const network = useRecoilValue(networkState);
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const { subgraph, exchanges } = useSynthetixQueries();
	const currencyKey = synth.name as CurrencyKey;

	let priceChange = 0;

	if (currencyKey !== Synths.sUSD) {
		//  TODO @DEV the dailyCandle query is broken on L1 but this is super important for fetching
		// the price in a time range. So we need to use the exchanges subgraph when user is on L1.
		// For L2 we should use the subgraph namespace. Once this bug is fixed on L1, delete it and
		// just use the subgraph namespace.
		const synthCandle = (network.id === 10 ? subgraph : exchanges).useGetDailyCandles(
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
