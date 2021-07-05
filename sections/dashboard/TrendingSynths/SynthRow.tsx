import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import Currency from 'components/Currency';

import { NO_VALUE } from 'constants/placeholder';
import { Period } from 'constants/period';
import ROUTES from 'constants/routes';

import { SelectableCurrencyRow } from 'styles/common';
import useMarketClosed from 'hooks/useMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import { networkState } from 'store/wallet';
import { Synth } from '@synthetixio/contracts-interface';
import { CurrencyKey } from 'constants/currency';

type SynthRowProps = {
	price: number | null;
	synth: Synth;
};
const SynthRow: FC<SynthRowProps> = ({ price, synth }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const currencyKey = synth.name as CurrencyKey;

	const network = useRecoilValue(networkState);
	const { useHistoricalRatesQuery } = useSynthetixQueries({
		networkId: network.id,
	});

	const historicalRates = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY, {
		refetchInterval: false,
	});
	const { marketClosureReason } = useMarketClosed(currencyKey);

	return (
		<StyledSelectableCurrencyRow
			isSelectable={true}
			onClick={() => router.push(ROUTES.Exchange.Into(currencyKey))}
		>
			<Currency.Name
				currencyKey={currencyKey}
				name={t('common.currency.synthetic-currency-name', {
					currencyName: synth.description,
				})}
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
