import { FC } from 'react';
import styled from 'styled-components';

import { Synths } from 'constants/currency';

import media from 'styles/media';

import CRatioSelector from './components/CRatioSelector';

import useShort from '../hooks/useShort';

import { CurrencyCardsSelector, ExchangeCardsWithSelector } from 'styles/common';

import { useTranslation, Trans } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';

import { MessageContainer, Message } from '../common';
import NetworksSwitcher from 'sections/shared/Layout/AppLayout/Header/NetworksSwitcher';

const ShortingCard: FC = () => {
	const { quoteCurrencyCard, baseCurrencyCard, footerCard } = useShort({
		defaultBaseCurrencyKey: Synths.sETH,
		defaultQuoteCurrencyKey: Synths.sUSD,
	});

	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);

	return (
		<Container>
			{isL2 ? (
				<ConvertContainer>
					<ExchangeCardsWithSelector>
						{quoteCurrencyCard}
						{baseCurrencyCard}
						<StyledCurrencyCardsSelector>
							<CRatioSelector />
						</StyledCurrencyCardsSelector>
					</ExchangeCardsWithSelector>
					<ExchangeFooter>{footerCard}</ExchangeFooter>
				</ConvertContainer>
			) : (
				<MessageContainer>
					<Message>
						<Trans t={t} i18nKey="shorting.l1-deprecated" />
					</Message>
					<NetworksSwitcher />
				</MessageContainer>
			)}
		</Container>
	);
};

const Container = styled.div`
	position: relative;
	margin-bottom: 30px;
	${media.lessThan('md')`
		// TODO: this is needed to cancel the content "push" that comes content from "TradeSummaryCard" (on tablet/mobile)
		margin-bottom: -50px;
	`}
`;

const ConvertContainer = styled.div``;

const StyledCurrencyCardsSelector = styled(CurrencyCardsSelector)`
	width: 70px;
`;

export const ExchangeFooter = styled.div`
	.footer-card {
		max-width: 1000px;
	}
`;

export default ShortingCard;
