import { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import useMarketClosed, { MarketClosure } from 'hooks/useMarketClosed';
import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';
import { baseCurrencyKeyState, quoteCurrencyKeyState } from 'store/exchange';
import { useRecoilValue } from 'recoil';

type MarketClosureCardProps = {
	attached?: boolean;
	baseCurrencyMarketClosed: MarketClosure;
	quoteCurrencyMarketClosed: MarketClosure;
};

const MarketClosureCard: FC<MarketClosureCardProps> = ({ attached }) => {
	const { t } = useTranslation();

	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);

	const quoteCurrencyMarketClosed = useMarketClosed(quoteCurrencyKey);
	const baseCurrencyMarketClosed = useMarketClosed(baseCurrencyKey);

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
				<MessageButton disabled={true}>
					{t(`exchange.footer-card.market-closure.button-label`)}
				</MessageButton>
			</MessageContainer>
		</>
	);
};

export default MarketClosureCard;
