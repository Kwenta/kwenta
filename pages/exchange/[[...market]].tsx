import { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Slider from 'react-slick';
import { Svg } from 'react-optimized-image';
import { AnimateSharedLayout, AnimatePresence, motion } from 'framer-motion';

import ArrowsIcon from 'assets/svg/app/arrows.svg';
import SingleChartIcon from 'assets/svg/app/single-chart.svg';
import DoubleChartIcon from 'assets/svg/app/double-chart.svg';
import { zIndex } from 'constants/ui';
import AppLayout from 'sections/shared/Layout/AppLayout';

import { formatCurrency } from 'utils/formatters/number';

import media from 'styles/media';

import {
	FlexDivColCentered,
	PageContent,
	MobileContainerMixin,
	SwapCurrenciesButton,
	FlexDivCol,
} from 'styles/common';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import useExchange from 'sections/exchange/hooks/useExchange';
import { CurrencyKey } from 'constants/currency';
import useChartWideWidth from 'sections/exchange/hooks/useChartWideWidth';
import { DEFAULT_WIDTH } from 'sections/exchange/TradeCard/constants';

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
		combinedPriceChartCard,
		combinedMarketDetailsCard,
	} = useExchange({
		showPriceCard: true,
		showMarketDetailsCard: true,
		footerCardAttached: false,
		routingEnabled: true,
		persistSelectedCurrencies: true,
		showNoSynthsCard: true,
	});

	const [isShowingSingleChart, setIsShowingSingleChart] = useState(false);
	const toggleIsShowingSingleChart = () => setIsShowingSingleChart((bool) => !bool);
	const wideWidth = useChartWideWidth();

	const chartsToggler = (
		<ChartsTogglerContainer>
			<ChartsToggler onClick={toggleIsShowingSingleChart}>
				<ChartsTogglerText active={isShowingSingleChart}>
					{t('exchange.charts.single')}
				</ChartsTogglerText>
				{isShowingSingleChart ? <Svg src={SingleChartIcon} /> : <Svg src={DoubleChartIcon} />}
				<ChartsTogglerText active={!isShowingSingleChart}>
					{t('exchange.charts.double')}
				</ChartsTogglerText>
			</ChartsToggler>
		</ChartsTogglerContainer>
	);

	return (
		<>
			<Head>
				<title>
					{baseCurrencyKey != null && quoteCurrencyKey != null
						? t('exchange.page-title-currency-pair', {
								baseCurrencyKey,
								quoteCurrencyKey,
								rate: formatCurrency(quoteCurrencyKey as CurrencyKey, inverseRate, {
									currencyKey: quoteCurrencyKey as CurrencyKey,
								}),
						  })
						: t('exchange.page-title')}
				</title>
			</Head>
			<AppLayout>
				<StyledPageContent>
					<DesktopOnlyView>
						<DesktopContainer>
							<SwapCurrenciesButtonContainer>
								<SwapCurrenciesButton onClick={handleCurrencySwap} data-testid="swap-btn">
									<Svg src={ArrowsIcon} />
								</SwapCurrenciesButton>
							</SwapCurrenciesButtonContainer>

							<PageWidthContainer>
								<DesktopCardsContainer>
									<LeftCardContainer data-testid="left-side">{quoteCurrencyCard}</LeftCardContainer>
									<RightCardContainer data-testid="right-side">
										{baseCurrencyCard}
									</RightCardContainer>
								</DesktopCardsContainer>
							</PageWidthContainer>

							<PageWidthContainer>{footerCard}</PageWidthContainer>

							<AnimateSharedLayout>
								{chartsToggler}

								<ChartsContainer>
									{isShowingSingleChart ? (
										<AnimatePresence>
											<motion.div
												layout
												initial={{ width: wideWidth }}
												animate={{ width: DEFAULT_WIDTH }}
												exit={{ width: wideWidth }}
												transition={{ ease: 'easeOut' }}
											>
												{combinedPriceChartCard}
											</motion.div>
										</AnimatePresence>
									) : (
										<AnimatePresence>
											<motion.div
												layout
												initial={{ width: DEFAULT_WIDTH }}
												animate={{ width: wideWidth }}
												exit={{ width: DEFAULT_WIDTH }}
												transition={{ ease: 'easeOut' }}
											>
												<DesktopCardsGapped>
													<LeftCardContainer data-testid="left-side">
														{quotePriceChartCard}
													</LeftCardContainer>
													<RightCardContainer data-testid="right-side">
														{basePriceChartCard}
													</RightCardContainer>
												</DesktopCardsGapped>
											</motion.div>
										</AnimatePresence>
									)}
								</ChartsContainer>

								<ChartsContainer>
									{isShowingSingleChart ? (
										<motion.div
											layout
											initial={{ width: wideWidth }}
											animate={{ width: DEFAULT_WIDTH }}
											exit={{ width: wideWidth }}
											transition={{ ease: 'easeOut' }}
										>
											{combinedMarketDetailsCard}
										</motion.div>
									) : (
										<motion.div
											layout
											initial={{ width: DEFAULT_WIDTH }}
											animate={{ width: wideWidth }}
											exit={{ width: DEFAULT_WIDTH }}
											transition={{ ease: 'easeOut' }}
										>
											<DesktopCardsGapped>
												<LeftCardContainer data-testid="left-side">
													{quoteMarketDetailsCard}
												</LeftCardContainer>
												<RightCardContainer data-testid="right-side">
													{baseMarketDetailsCard}
												</RightCardContainer>
											</DesktopCardsGapped>
										</motion.div>
									)}
								</ChartsContainer>
							</AnimateSharedLayout>
						</DesktopContainer>
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

							{chartsToggler}

							{isShowingSingleChart ? (
								<>
									{combinedPriceChartCard}
									<FooterSpacer />
									{combinedMarketDetailsCard}
								</>
							) : (
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
							)}
						</MobileContainer>
					</MobileOrTabletView>
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
		padding: 55px 40px 40px;
	`}

	.currency-card {
		${media.lessThan('md')`
		width: 100%;
	`}
	}

	.market-details-card {
		width: 100%;
		${media.lessThan('md')`
		max-width: unset;
	`}
	}
`;

const ChartsContainer = styled.div`
	margin: 0 auto 30px;
`;

const PageWidthContainer = styled.div`
	width: ${DEFAULT_WIDTH}px;
	margin: 0 auto;
`;

const DesktopContainer = styled(FlexDivCol)``;

const DesktopCardsContainer = styled.div`
	display: grid;
	padding-bottom: 2px;
	gap: 2px;
	grid-template-columns: 1fr 1fr;
	flex: 1;
`;

const DesktopCardsGapped = styled(DesktopCardsContainer)`
	grid-gap: 60px;
	margin: 0 auto;
`;

const SwapCurrenciesButtonContainer = styled.div`
	align-self: flex-start;
	margin-top: 37px;
	position: absolute;
	left: calc(50% - 16px);
	z-index: ${zIndex.BASE + 10};
`;

const CardContainerMixin = `
	display: grid;
`;

const LeftCardContainer = styled.div`
	${CardContainerMixin};
`;

const RightCardContainer = styled.div`
	${CardContainerMixin};
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

const FooterSpacer = styled.div`
	margin-top: 20px;
`;

const SliderContent = styled.div``;

const SliderContentSpacer = styled.div`
	height: 16px;
`;

const ChartsTogglerContainer = styled.div`
	position: relative;
	z-index: 1000;

	${media.lessThan('md')`
		padding: 20px 0 30px;
	`}
`;

const ChartsToggler = styled.div`
	position: absolute;
	left: calc(50% - 67.5px);
	width: 135px;
	height: 20px;
	border-radius: 5px;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: ${(props) => props.theme.colors.black};
`;

const ChartsTogglerText = styled.div<{ active: boolean }>`
	text-transform: uppercase;
	color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.silver)};
`;

export default ExchangePage;
