import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';
import { MarketClosure } from 'hooks/useMarketClosed';

type MarketClosureCardProps = {
	attached?: boolean;
	baseCurrencyMarketClosed: MarketClosure;
	quoteCurrencyMarketClosed: MarketClosure;
};

const MarketClosureCard: FC<MarketClosureCardProps> = ({
	attached,
	baseCurrencyMarketClosed,
	quoteCurrencyMarketClosed,
}) => {
	const { t } = useTranslation();

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
			<MessageContainer attached={attached}>
				<DesktopOnlyView>
					<Message>
						{t(`exchange.footer-card.market-closure.reasons.${getSuspensionReason}.message`)}
					</Message>
				</DesktopOnlyView>
				<MessageButton disabled={true}>
					{t(`exchange.footer-card.market-closure.button-label`)}
				</MessageButton>
			</MessageContainer>
		</>
	);
};

export default MarketClosureCard;
