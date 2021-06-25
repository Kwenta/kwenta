import { FC } from 'react';
import { CurrencyKey } from 'constants/currency';
import { Trans } from 'react-i18next';

import { NoTextTransform } from 'styles/common';
import { CurrencyLabelWithDot, PriceDot } from './styles';

const CurrencyLabelsWithDots: FC<{
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
}> = ({ baseCurrencyKey, quoteCurrencyKey }) => {
	return (
		<>
			<CurrencyLabelWithDot>
				<Trans
					i18nKey="common.currency.currency-price"
					values={{ currencyKey: baseCurrencyKey }}
					components={[<NoTextTransform />]}
				/>
				<PriceDot color={'#395BC5'} />
			</CurrencyLabelWithDot>
			<CurrencyLabelWithDot>
				<Trans
					i18nKey="common.currency.currency-price"
					values={{ currencyKey: quoteCurrencyKey }}
					components={[<NoTextTransform />]}
				/>
				<PriceDot color={'#7AC09F'} />
			</CurrencyLabelWithDot>
		</>
	);
};

export default CurrencyLabelsWithDots;
