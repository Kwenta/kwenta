import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';

import { EXTERNAL_LINKS } from 'constants/links';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';

import { NoTextTransform, ExternalLink } from 'styles/common';

import { RoundedContainer } from '../common';

const { sUSD } = SYNTHS_MAP;
const { ETH } = CRYPTO_CURRENCY_MAP;

const NoSynthsCard: FC = () => {
	const { t } = useTranslation();

	return (
		<RoundedContainer>
			<Message>
				<Trans
					t={t}
					i18nKey="exchange.no-synths-card.message"
					values={{ currencyKey: sUSD }}
					components={[<NoTextTransform />]}
				/>
			</Message>
			<ExternalLink href={EXTERNAL_LINKS.Trading.OneInchLink(ETH, sUSD)}>
				<Button variant="primary" isRounded={true} size="lg">
					<Trans
						t={t}
						i18nKey="common.currency.get-currency"
						values={{ currencyKey: sUSD }}
						components={[<NoTextTransform />]}
					/>
				</Button>
			</ExternalLink>
		</RoundedContainer>
	);
};

const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	padding-left: 20px;
`;

export default NoSynthsCard;
