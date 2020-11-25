import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';

import Button from 'components/Button';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';

import { ExternalLink, NoTextTransform } from 'styles/common';
import media from 'styles/media';

import useExchange from 'sections/exchange/hooks/useExchange';
import { EXTERNAL_LINKS } from 'constants/links';

const CurrencyConvertCard: FC = () => {
	const { t } = useTranslation();

	const { quoteCurrencyCard, baseCurrencyCard, footerCard } = useExchange({
		defaultBaseCurrencyKey: SYNTHS_MAP.sUSD,
		defaultQuoteCurrencyKey: CRYPTO_CURRENCY_MAP.ETH,
		footerCardAttached: true,
		persistSelectedCurrencies: false,
		allowCurrencySelection: false,
		showNoSynthsCard: false,
	});

	return (
		<Container>
			<ConvertContainer>
				<ExchangeCards>
					{quoteCurrencyCard}
					{baseCurrencyCard}
				</ExchangeCards>
				<ExchangeFooter>{footerCard}</ExchangeFooter>
			</ConvertContainer>
			<Message>
				<MessageTitle>{t('dashboard.onboard.convert-card.disabled-message.title')}</MessageTitle>
				<MessageBody>{t('dashboard.onboard.convert-card.disabled-message.body')}</MessageBody>
				<ExternalLink
					href={EXTERNAL_LINKS.Trading.OneInchLink(CRYPTO_CURRENCY_MAP.ETH, SYNTHS_MAP.sUSD)}
				>
					<Button variant="primary" size="lg" isRounded={true}>
						<Trans
							t={t}
							i18nKey="common.currency.buy-currency"
							values={{ currencyKey: SYNTHS_MAP.sUSD }}
							components={[<NoTextTransform />]}
						/>
					</Button>
				</ExternalLink>
			</Message>
		</Container>
	);
};

const Container = styled.div`
	position: relative;
`;

const ConvertContainer = styled.div`
	opacity: 0.2;
	pointer-events: none;
`;

const Message = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	text-align: center;
`;

const MessageTitle = styled.div`
	padding-bottom: 10px;
`;

const MessageBody = styled.div`
	padding-bottom: 20px;
`;

export const ExchangeFooter = styled.div`
	.footer-card {
		max-width: 1000px;
	}
`;

export const ExchangeCards = styled.div`
	display: grid;
	grid-template-columns: auto auto;
	grid-gap: 2px;
	padding-bottom: 2px;
	width: 100%;
	margin: 0 auto;
	${media.lessThan('md')`
		grid-template-columns: unset;
		grid-template-rows: auto auto;
		padding-bottom: 24px;
	`}

	.currency-card {
		padding: 0 14px;
		width: 100%;
	}
`;

export default CurrencyConvertCard;
