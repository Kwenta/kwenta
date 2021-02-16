import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Slider from 'react-slick';
import { Svg } from 'react-optimized-image';

import ArrowsIcon from 'assets/svg/app/arrows.svg';

import AppLayout from 'sections/shared/Layout/AppLayout';

import { formatCurrency } from 'utils/formatters/number';

import media from 'styles/media';

import {
	FlexDiv,
	FlexDivColCentered,
	PageContent,
	MobileContainerMixin,
	SwapCurrenciesButton,
} from 'styles/common';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import useExchange from 'sections/exchange/hooks/useExchange';

const ExchangePage = () => {
	const { t } = useTranslation();

	const {
		baseCurrencyKey,
		quoteCurrencyKey,
		inverseRate,
		quoteCurrencyCard,
		quotePriceChartCard,
		quoteMarketDetailsCard,
		baseCurrencyCard,
		baseMarketDetailsCard,
		basePriceChartCard,
		handleCurrencySwap,
		footerCard,
	} = useExchange({
		showPriceCard: true,
		showMarketDetailsCard: true,
		footerCardAttached: false,
		routingEnabled: true,
		persistSelectedCurrencies: true,
		showNoSynthsCard: true,
	});

	return (
		<>
			<Head>
				<title>
					{baseCurrencyKey != null && quoteCurrencyKey != null
						? t('exchange.page-title-currency-pair', {
								baseCurrencyKey,
								quoteCurrencyKey,
								rate: formatCurrency(quoteCurrencyKey, inverseRate, {
									currencyKey: quoteCurrencyKey,
								}),
						  })
						: t('exchange.page-title')}
				</title>
			</Head>
			<AppLayout>
				<StyledPageContent>
					<DesktopOnlyView>
						<DesktopCardsContainer>
							<LeftCardContainer data-testid="left-side">
								{quoteCurrencyCard}
								{quotePriceChartCard}
								{quoteMarketDetailsCard}
							</LeftCardContainer>
							<Spacer>
								<SwapCurrenciesButton onClick={handleCurrencySwap} data-testid="swap-btn">
									<Svg src={ArrowsIcon} />
								</SwapCurrenciesButton>
							</Spacer>
							<RightCardContainer data-testid="right-side">
								{baseCurrencyCard}
								{basePriceChartCard}
								{baseMarketDetailsCard}
							</RightCardContainer>
						</DesktopCardsContainer>
					</DesktopOnlyView>
					<MobileOrTabletView>
						<MobileContainer>
							{quoteCurrencyCard}
							<VerticalSpacer>
								<SwapCurrenciesButton onClick={handleCurrencySwap} data-testid="swap-btn">
									<Svg src={ArrowsIcon} />
								</SwapCurrenciesButton>
							</VerticalSpacer>
							{baseCurrencyCard}
							<SliderContainer>
								<Slider arrows={false} dots={false}>
									<SliderContent data-testid="left-side">
										{basePriceChartCard}
										<SliderContentSpacer />
										{baseMarketDetailsCard}
									</SliderContent>
									<SliderContent data-testid="right-side">
										{quotePriceChartCard}
										<SliderContentSpacer />
										{quoteMarketDetailsCard}
									</SliderContent>
								</Slider>
							</SliderContainer>
						</MobileContainer>
					</MobileOrTabletView>
					{footerCard}
				</StyledPageContent>
			</AppLayout>
		</>
	);
};

const StyledPageContent = styled(PageContent)`
	${media.greaterThan('md')`
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-bottom: 40px;
		padding-top: 55px;
	`}

	.currency-card {
		width: 312px;
		${media.lessThan('md')`
		width: 100%;
	`}
	}

	.market-details-card {
		max-width: 618px;
		width: 100%;
		${media.lessThan('md')`
		max-width: unset;
	`}
	}
`;

const DesktopCardsContainer = styled(FlexDiv)`
	align-items: flex-start;
	justify-content: center;
	padding-bottom: 24px;
`;

const Spacer = styled.div`
	padding: 0 16px;
	align-self: flex-start;
	margin-top: 43px;
`;

const CardContainerMixin = `
	display: grid;
	grid-gap: 24px;
	width: 100%;
`;

const LeftCardContainer = styled.div`
	${CardContainerMixin};
	justify-items: right;
`;

const RightCardContainer = styled.div`
	${CardContainerMixin};
	justify-items: left;
`;

const MobileContainer = styled(FlexDivColCentered)`
	${MobileContainerMixin};
`;

const VerticalSpacer = styled.div`
	height: 2px;
	position: relative;
	${SwapCurrenciesButton} {
		position: absolute;
		transform: translate(-50%, -50%) rotate(90deg);
		border: 2px solid ${(props) => props.theme.colors.black};
	}
`;

const SliderContainer = styled.div`
	padding: 16px 0;
	width: 100%;
	* {
		outline: none;
	}
`;

const SliderContent = styled.div``;

const SliderContentSpacer = styled.div`
	height: 16px;
`;

export default ExchangePage;
