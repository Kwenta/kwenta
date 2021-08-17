import { FC } from 'react';
import formatDate from 'date-fns/format';
import { useTranslation } from 'react-i18next';

import { CurrencyPrice, TooltipContentStyle, LabelStyle } from './styles';

const CustomTooltip: FC<{
	active: boolean;
	payload: [
		{
			value: number;
		}
	];
	label: Date;
	formatCurrentPrice: (n: number) => string;
}> = ({ active, label, payload, formatCurrentPrice }) => {
	const { t } = useTranslation();

	return !(active && payload && payload[0]) ? null : (
		<TooltipContentStyle>
			<LabelStyle>{formatDate(label, 'do MMM yy | HH:mm')}</LabelStyle>
			<LabelStyle>
				{t('exchange.price-chart-card.tooltip.price')}
				{': '}
				<CurrencyPrice>{formatCurrentPrice(payload[0].value)}</CurrencyPrice>
			</LabelStyle>
		</TooltipContentStyle>
	);
};

export default CustomTooltip;
