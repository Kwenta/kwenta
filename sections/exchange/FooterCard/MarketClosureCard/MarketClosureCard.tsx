import { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAppSelector } from 'state/hooks';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import useMarketClosed from 'hooks/useMarketClosed';

import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';

const MarketClosureCard: FC = () => {
	const { t } = useTranslation();
	const { quoteCurrencyKey, baseCurrencyKey } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		baseCurrencyKey: exchange.baseCurrencyKey,
	}));

	const quoteCurrencyMarketClosed = useMarketClosed(quoteCurrencyKey ?? null);
	const baseCurrencyMarketClosed = useMarketClosed(baseCurrencyKey ?? null);

	const getSuspensionReason = useMemo(() => {
		if (baseCurrencyMarketClosed.isMarketClosed && quoteCurrencyMarketClosed.isMarketClosed) {
			return 'both-synths-suspended';
		}
		return (
			baseCurrencyMarketClosed.marketClosureReason || quoteCurrencyMarketClosed.marketClosureReason
		);
	}, [baseCurrencyMarketClosed, quoteCurrencyMarketClosed]);

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
								currencyKey: baseCurrencyMarketClosed.isMarketClosed
									? baseCurrencyKey
									: quoteCurrencyKey,
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
};

export default MarketClosureCard;
