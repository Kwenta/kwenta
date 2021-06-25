import { useTranslation } from 'react-i18next';
import { FC } from 'react';
import styled from 'styled-components';

import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';
import { PERIOD_LABELS_MAP } from 'constants/period';
import { FlexDivRowCentered } from 'styles/common';
import { formatCurrency } from 'utils/formatters/number';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Card from 'components/Card';
import useCombinedRates from 'sections/exchange/TradeCard/Charts/hooks/useCombinedRates';

type MarketDetailsCardProps = {
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	basePriceRate: number | null;
	quotePriceRate: number | null;
	className?: string;
};

const MarketDetailsCard: FC<MarketDetailsCardProps> = ({
	baseCurrencyKey,
	quoteCurrencyKey,
	basePriceRate,
	quotePriceRate,
	...rest
}) => {
	const { t } = useTranslation();
	const pairCurrencyName = `${quoteCurrencyKey}/${baseCurrencyKey}`;

	const { low: rates24Low, high: rates24High } = useCombinedRates({
		baseCurrencyKey,
		quoteCurrencyKey,
		selectedChartPeriodLabel: PERIOD_LABELS_MAP.ONE_DAY,
	});

	const rates24HighItem = (
		<Item>
			<Label>{t('exchange.market-details-card.24h-high')}</Label>
			<Value>
				{rates24High != null
					? `${formatCurrency(pairCurrencyName, rates24High, {
							minDecimals: 4,
					  })}`
					: NO_VALUE}
			</Value>
		</Item>
	);

	const rates24HLowItem = (
		<Item>
			<Label>{t('exchange.market-details-card.24h-low')}</Label>
			<Value>
				{rates24Low != null
					? `${formatCurrency(pairCurrencyName, rates24Low, {
							minDecimals: 4,
					  })}`
					: NO_VALUE}
			</Value>
		</Item>
	);

	return (
		<Card className="market-details-card" {...rest}>
			<StyledCardHeader>{t('exchange.market-details-card.title')}</StyledCardHeader>
			<DesktopOnlyView>
				<StyledCardBody>
					<Column>{rates24HighItem}</Column>
					<Column>{rates24HLowItem}</Column>
				</StyledCardBody>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledCardBody>
					<Column>
						{rates24HighItem}
						{rates24HLowItem}
					</Column>
				</StyledCardBody>
			</MobileOrTabletView>
		</Card>
	);
};

const StyledCardBody = styled(Card.Body)`
	display: grid;
	grid-gap: 40px;
	grid-auto-flow: column;
	padding: 8px 18px;
`;

const StyledCardHeader = styled(Card.Header)`
	height: 40px;
`;

const Item = styled(FlexDivRowCentered)`
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	padding: 8px 0;
`;

const Column = styled.div`
	${Item}:last-child {
		border-bottom: 0;
	}
`;

const Label = styled.div`
	text-transform: capitalize;
`;

const Value = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;

export default MarketDetailsCard;
