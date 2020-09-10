import { useState } from 'react';
import styled from 'styled-components';
import synthetix from 'lib/synthetix';
import { useRecoilValue } from 'recoil';

import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { priceCurrencyState } from 'store/app';

import { FlexDiv, CapitalizedText, FlexDivRow, FlexDivCol } from 'styles/common';
import { TabList, TabPanel, TabButton } from 'components/Tab';
import useSynthsBalancesQuery, {
	SynthBalance,
} from 'queries/walletBalances/useSynthsBalancesQuery';
import Currency from 'components/Currency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { fonts } from 'styles/theme/fonts';
import Button from 'components/Button';

const TABS = {
	SYNTH_BALANCES: 'synth-balances',
	CONVERT: 'convert',
	CRYPTO_BALANCES: 'crypto-balances',
	TRANSACTIONS: 'transactions',
};

const SynthBalances = () => {
	const exchangeRatesQuery = useExchangeRatesQuery({ refetchInterval: false });
	const synthsBalancesQuery = useSynthsBalancesQuery({ enabled: exchangeRatesQuery.isSuccess });
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	return (
		<FlexDiv>
			{synthsBalancesQuery.isSuccess &&
				synthsBalancesQuery.data.balances.map((synth: SynthBalance) => {
					const synthDesc =
						synthetix.synthsMap != null ? synthetix.synthsMap[synth.currencyKey]?.desc : '';
					return (
						<FlexDivRow>
							<FlexDivCol>
								<Currency.Name currencyKey={synth.currencyKey} name={synthDesc} showIcon={true} />
							</FlexDivCol>
							<FlexDivCol>
								<Currency.Amount
									currencyKey={synth.currencyKey}
									amount={synth.balance}
									totalValue={synth.usdBalance}
									sign={selectedPriceCurrency.sign}
								/>
							</FlexDivCol>
							<FlexDivCol>
								{exchangeRatesQuery.data !== undefined && (
									<Currency.Price
										currencyKey={synth.currencyKey}
										price={exchangeRatesQuery.data[synth.currencyKey]}
										sign={selectedPriceCurrency.sign}
									/>
								)}
							</FlexDivCol>
							<FlexDivCol>Percent</FlexDivCol>
						</FlexDivRow>
					);
				})}
		</FlexDiv>
	);
};

const DashboardPage = () => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState(TABS.SYNTH_BALANCES);
	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<CardsContainer>
				<LeftCardContainer>
					<CapitalizedText>
						<NoSynths />
						<div>{t('dashboard.your-profile.title')}</div>
						<TabList>
							<TabButton
								name={TABS.SYNTH_BALANCES}
								active={activeTab === TABS.SYNTH_BALANCES}
								onClick={() => setActiveTab(TABS.SYNTH_BALANCES)}
							>
								{t('dashboard.tabs.nav.synth-balances')}
							</TabButton>
							<TabButton
								name={TABS.CONVERT}
								active={activeTab === TABS.CONVERT}
								onClick={() => setActiveTab(TABS.CONVERT)}
							>
								{t('dashboard.tabs.nav.convert')}
							</TabButton>
							<TabButton
								name={TABS.CRYPTO_BALANCES}
								active={activeTab === TABS.CRYPTO_BALANCES}
								onClick={() => setActiveTab(TABS.CRYPTO_BALANCES)}
							>
								{t('dashboard.tabs.nav.crypto-balances')}
							</TabButton>
							<TabButton
								name={TABS.TRANSACTIONS}
								active={activeTab === TABS.TRANSACTIONS}
								onClick={() => setActiveTab(TABS.TRANSACTIONS)}
							>
								{t('dashboard.tabs.nav.transactions')}
							</TabButton>
						</TabList>

						<TabPanel name={TABS.SYNTH_BALANCES} activeTab={activeTab}>
							<SynthBalances />
						</TabPanel>
					</CapitalizedText>
				</LeftCardContainer>
				<RightCardContainer>
					<RightBarTitle>{t('dashboard.watchlist.title')}</RightBarTitle>
				</RightCardContainer>
			</CardsContainer>
		</>
	);
};

const RightBarTitle = styled.div`
	${fonts.body['bold-medium']}
	color: ${(props) => props.theme.colors.white};
`;

const CardsContainer = styled(FlexDiv)`
	justify-content: space-between;
	width: 100%;
`;

const LeftCardContainer = styled.div`
	flex: 1;
	max-width: 1000px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48px 0px;
`;

const RightCardContainer = styled.div`
	width: 356px;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 48px 32px;
`;

const NoSynthTitle = styled.div`
	${fonts.data['title-small']}
	color: ${(props) => props.theme.colors.blueberry};
	text-transform: uppercase;
	text-align: center;
	margin-bottom: 4px;
`;

const NoSynthSubtitle = styled.div`
	${fonts.heading.h4}
	color: ${(props) => props.theme.colors.white};
	text-align:center;
	margin-bottom: 33px;
`;

const Center = styled.div`
	margin: 0 auto;
	margin-bottom: 78px;
`;

const NoSynths = () => (
	<FlexDiv>
		<FlexDivCol>
			<NoSynthTitle>Learn How it Works</NoSynthTitle>
			<NoSynthSubtitle>Get up and running on Kwenta and exchange everything.</NoSynthSubtitle>
			<Center>
				<Button variant="primary" isRounded={true} size="lg">
					Learn More
				</Button>
			</Center>
		</FlexDivCol>
	</FlexDiv>
);

export default DashboardPage;
