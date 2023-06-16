import { FC, useMemo, memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { SynthSymbol } from 'sdk/src/data/synths';
import {
	MessageContainer,
	Message,
	MessageButton,
	FixedMessageContainerSpacer,
} from 'sections/exchange/message';
import { useAppSelector } from 'state/hooks';

const MarketClosureCard: FC = memo(() => {
	const { t } = useTranslation();
	const { quoteCurrencyKey, baseCurrencyKey, synthSuspensions } = useAppSelector(
		({ exchange }) => ({
			quoteCurrencyKey: exchange.quoteCurrencyKey,
			baseCurrencyKey: exchange.baseCurrencyKey,
			synthSuspensions: exchange.synthSuspensions,
		})
	);

	const quoteSuspensionData = quoteCurrencyKey
		? synthSuspensions?.[quoteCurrencyKey as SynthSymbol]
		: undefined;

	const baseSuspensionData = baseCurrencyKey
		? synthSuspensions?.[baseCurrencyKey as SynthSymbol]
		: undefined;

	const getSuspensionReason = useMemo(() => {
		if (baseSuspensionData?.isSuspended && quoteSuspensionData?.isSuspended) {
			return 'both-synths-suspended';
		}

		return baseSuspensionData?.reason || quoteSuspensionData?.reason;
	}, [baseSuspensionData, quoteSuspensionData]);

	return (
		<>
			<MobileOrTabletView>
				<FixedMessageContainerSpacer />
			</MobileOrTabletView>
			<MessageContainer className="footer-card">
				<DesktopOnlyView>
					<Message>
						<Trans
							i18nKey={`exchange.footer-card.market-closure.reasons.${getSuspensionReason}.message`}
							values={{
								currencyKey: baseSuspensionData?.isSuspended ? baseCurrencyKey : quoteCurrencyKey,
							}}
						/>
					</Message>
				</DesktopOnlyView>
				<MessageButton disabled>
					{t(`exchange.footer-card.market-closure.button-label`)}
				</MessageButton>
			</MessageContainer>
		</>
	);
});

export default MarketClosureCard;
