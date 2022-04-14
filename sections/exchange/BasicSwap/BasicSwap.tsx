import { FC } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import ArrowIcon from 'assets/svg/app/arrow-down.svg';

import { SwapCurrenciesButton, BoldText } from 'styles/common';
import { zIndex } from 'constants/ui';
import useExchange from 'sections/exchange/hooks/useExchange';
import { useTranslation } from 'react-i18next';

const BasicSwap: FC = () => {
	const { t } = useTranslation();
	const { quoteCurrencyCard, baseCurrencyCard, footerCard, handleCurrencySwap } = useExchange({
		showPriceCard: true,
		showMarketDetailsCard: true,
		footerCardAttached: false,
		routingEnabled: true,
		persistSelectedCurrencies: true,
		showNoSynthsCard: false,
	});

	return (
		<>
			<ExchangeTitle>{t('exchange.synth-exchange')}</ExchangeTitle>
			<PageWidthContainer>
				<DesktopCardsContainer>
					<TopCardContainer data-testid="top-side">{quoteCurrencyCard}</TopCardContainer>
					<SwapCurrenciesButtonContainer>
						<SwapCurrenciesButton onClick={handleCurrencySwap} data-testid="swap-btn">
							<Svg src={ArrowIcon} />
						</SwapCurrenciesButton>
					</SwapCurrenciesButtonContainer>
					<BottomCardContainer data-testid="bottom-side">{baseCurrencyCard}</BottomCardContainer>
				</DesktopCardsContainer>
			</PageWidthContainer>
			<PageWidthContainer>{footerCard}</PageWidthContainer>
		</>
	);
};

export default BasicSwap;

const ExchangeTitle = styled(BoldText)`
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-size: 30px;
	margin-bottom: 1.5em;
	text-align: center;
`;

const DesktopCardsContainer = styled.div`
	display: flex;
	flex-direction: column;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	background: ${(props) => props.theme.colors.cellGradient};
	box-shadow: ${(props) => props.theme.colors.selectedTheme.button.shadow};
	border-radius: 8px;
	box-sizing: border-box;
`;

const PageWidthContainer = styled.div`
	width: 565px;
	margin: 0 auto;
`;

const CardContainerMixin = `
	display: grid;
	height: 183px;
`;

const TopCardContainer = styled.div`
	${CardContainerMixin};
`;

const BottomCardContainer = styled.div`
	${CardContainerMixin};
`;

const SwapCurrenciesButtonContainer = styled.div`
	align-self: flex-start;
	margin-top: 170px;
	position: absolute;
	left: calc(50% - 16px);
	z-index: ${zIndex.BASE + 10};
`;
