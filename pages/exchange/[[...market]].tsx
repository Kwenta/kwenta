import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { AnimateSharedLayout, AnimatePresence, motion } from 'framer-motion';

import ArrowsIcon from 'assets/svg/app/arrows.svg';
import { zIndex } from 'constants/ui';
import AppLayout from 'sections/shared/Layout/AppLayout';
import GitIDFooter from 'sections/shared/Layout/AppLayout/GitID';

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
import { DEFAULT_WIDTH } from 'sections/exchange/TradeCard/constants';

const ExchangePage = () => {
	const { t } = useTranslation();

	const {
		baseCurrencyKey,
		quoteCurrencyKey,
		inverseRate,
		quoteCurrencyCard,
		baseCurrencyCard,
		handleCurrencySwap,
		footerCard,
		combinedPriceChartCard,
		combinedMarketDetailsCard,
		wideWidth,
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
								<ChartsContainer>
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
								</ChartsContainer>

								<ChartsContainer>
									<motion.div
										layout
										initial={{ width: wideWidth }}
										animate={{ width: DEFAULT_WIDTH }}
										exit={{ width: wideWidth }}
										transition={{ ease: 'easeOut' }}
									>
										{combinedMarketDetailsCard}
									</motion.div>
								</ChartsContainer>
							</AnimateSharedLayout>
							<GitIDFooter />
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
							<FooterContainer>{footerCard}</FooterContainer>
							<>
								{combinedPriceChartCard}
								<FooterSpacer />
								{combinedMarketDetailsCard}
							</>
							<GitIDFooter />
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

const FooterContainer = styled.div`
	width: 100%;
`;

const DesktopContainer = styled(FlexDivCol)``;

const DesktopCardsContainer = styled.div`
	display: grid;
	padding-bottom: 2px;
	gap: 2px;
	grid-template-columns: 1fr 1fr;
	flex: 1;
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
	margin-bottom: 110px;
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

const FooterSpacer = styled.div`
	margin-top: 20px;
`;

export default ExchangePage;
