import { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { MarketClosure } from 'hooks/useMarketClosed';
import { CurrencyKey } from 'constants/currency';
import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';

type MarketClosureCardProps = {
	attached?: boolean;
	baseCurrencyMarketClosed: MarketClosure;
	quoteCurrencyMarketClosed: MarketClosure;
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
};

const MarketClosureCard: FC<MarketClosureCardProps> = ({
	attached,
	baseCurrencyMarketClosed,
	quoteCurrencyMarketClosed,
	baseCurrencyKey,
	quoteCurrencyKey,
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
			<MessageContainer attached={attached} className="footer-card">
				<DesktopOnlyView>
					<Message>
						{getSuspensionReason !== null ? (
							<Trans
								i18nKey={`exchange.footer-card.market-closure.reasons.${getSuspensionReason}.message`}
								values={{
									currencyKey: baseCurrencyMarketClosed.isMarketClosed
										? baseCurrencyKey
										: quoteCurrencyKey,
								}}
							/>
						) : (
							<Trans
								i18nKey={`Market closed for maintenance.`}
								values={{
									currencyKey: baseCurrencyMarketClosed.isMarketClosed
										? baseCurrencyKey
										: quoteCurrencyKey,
								}}
							/>
						)}
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
