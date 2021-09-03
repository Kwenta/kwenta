import { FC } from 'react';
import formatDate from 'date-fns/format';
import { useTranslation } from 'react-i18next';

import { CurrencyPrice, TooltipContentStyle, LabelStyle } from './styles';

const CandlesticksTooltip: FC<{
	active: boolean;
	payload: [
		{
			value: number[];
		},
		{
			value: number[];
		}
	];
	label: Date;
	formatCurrentPrice: (n: number) => string;
}> = ({ active, label, payload, formatCurrentPrice }) => {
	const { t } = useTranslation();
	if (!active || !payload || !payload[0] || !payload[0].value) return null;
	const highLow = payload[0].value;
	const high = highLow[0];
	const low = highLow[1];
	const openClose = payload[1].value;
	const open = openClose[0];
	const close = openClose[1];

	return (
		<TooltipContentStyle>
			<LabelStyle>{formatDate(label, 'do MMM yy | HH:mm')}</LabelStyle>
			<LabelStyle>
				{t('exchange.price-chart-card.tooltip.high')}
				{': '}
				<CurrencyPrice>{formatCurrentPrice(high)}</CurrencyPrice>
			</LabelStyle>
			<LabelStyle>
				{t('exchange.price-chart-card.tooltip.open')}
				{': '}
				<CurrencyPrice>{formatCurrentPrice(open)}</CurrencyPrice>
			</LabelStyle>
			<LabelStyle>
				{t('exchange.price-chart-card.tooltip.close')}
				{': '}
				<CurrencyPrice>{formatCurrentPrice(close)}</CurrencyPrice>
			</LabelStyle>
			<LabelStyle>
				{t('exchange.price-chart-card.tooltip.low')}
				{': '}
				<CurrencyPrice>{formatCurrentPrice(low)}</CurrencyPrice>
			</LabelStyle>
		</TooltipContentStyle>
	);
};

export default CandlesticksTooltip;
