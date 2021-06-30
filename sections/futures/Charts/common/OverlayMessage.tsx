import { FC, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { MarketClosureReason } from 'hooks/useMarketClosed';
import MarketClosureIcon from 'components/MarketClosureIcon';
import {
	CurrencyKey,
	AFTER_HOURS_SYNTHS,
	COMMODITY_SYNTHS,
	FIAT_SYNTHS,
	LSE_SYNTHS,
	TSE_SYNTHS,
} from 'constants/currency';
import useMarketHoursTimer from 'sections/exchange/hooks/useMarketHoursTimer';
import marketNextOpen from 'utils/marketNextOpen';

import { OverlayMessageTitle, OverlayMessageSubtitle, OverlayTimer, LinkTag } from './styles';

const OverlayMessage: FC<{
	marketClosureReason: MarketClosureReason;
	currencyKey: CurrencyKey;
	openAfterHoursModalCallback?: () => void;
}> = ({ marketClosureReason, currencyKey, openAfterHoursModalCallback }) => {
	const { t } = useTranslation();
	const linkToAfterHoursMarket = useMemo(() => AFTER_HOURS_SYNTHS.has(currencyKey), [currencyKey]);
	const showMarketIsReopeningSoon = useMemo(
		() =>
			AFTER_HOURS_SYNTHS.has(currencyKey) ||
			TSE_SYNTHS.has(currencyKey) ||
			LSE_SYNTHS.has(currencyKey) ||
			FIAT_SYNTHS.has(currencyKey) ||
			COMMODITY_SYNTHS.has(currencyKey),
		[currencyKey]
	);
	const timer = useMarketHoursTimer(marketNextOpen(currencyKey) ?? null);

	return (
		<>
			<MarketClosureIcon {...{ marketClosureReason }} />
			<OverlayMessageTitle>
				<Trans
					i18nKey={`exchange.price-chart-card.overlay-messages.${marketClosureReason}.title`}
					values={{
						currencyKey,
					}}
				/>
			</OverlayMessageTitle>
			<OverlayMessageSubtitle>
				{openAfterHoursModalCallback != null && linkToAfterHoursMarket && (
					<>
						<Trans
							i18nKey="exchange.price-chart-card.overlay-messages.market-closure.after-hours"
							values={{
								linkText: t('exchange.price-chart-card.overlay-messages.market-closure.here'),
							}}
							components={{
								linkTag: <LinkTag onClick={openAfterHoursModalCallback} />,
							}}
						/>
					</>
				)}
			</OverlayMessageSubtitle>
			{marketClosureReason === 'market-closure' && showMarketIsReopeningSoon ? (
				<>
					<OverlayMessageSubtitle>Market reopens in: </OverlayMessageSubtitle>
					<OverlayTimer>{timer}</OverlayTimer>
				</>
			) : (
				<OverlayMessageSubtitle>
					{t(`exchange.price-chart-card.overlay-messages.${marketClosureReason}.subtitle`)}
				</OverlayMessageSubtitle>
			)}
		</>
	);
};

export default OverlayMessage;
