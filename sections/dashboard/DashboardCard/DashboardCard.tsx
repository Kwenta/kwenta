import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import { TabList, TabPanel, TabButton } from 'components/Tab';
import Currency from 'components/Currency';
import Loader from 'components/Loader';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import SynthBalances from 'sections/dashboard/SynthBalances';
import Transactions from 'sections/dashboard/Transactions';
import CurrencyConvertCard from 'sections/dashboard/CurrencyConvertCard';

import { BoldText } from 'styles/common';

import { CardTitle, ConvertContainer } from '../common';
import { useRecoilValue } from 'recoil';
import { priceCurrencyState } from 'store/app';

const TABS = {
	SYNTH_BALANCES: 'synth-balances',
	CONVERT: 'convert',
	TRANSACTIONS: 'transactions',
};

const DashboardCard: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const { tab } = router.query;

	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const synthsBalancesQuery = useSynthsBalancesQuery();

	const exchangeRates = exchangeRatesQuery.data ?? null;
	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const selectPriceCurrencyProps = {
		selectedPriceCurrency,
		selectPriceCurrencyRate,
	};

	if (synthsBalancesQuery.isLoading) {
		return <Loader />;
	}

	// TODO: switch to set/route based tabs
	const activeTab = !!tab
		? tab[0]
		: synthBalances?.balances.length === 0
		? TABS.CONVERT
		: TABS.SYNTH_BALANCES;

	return (
		<>
			<Totals>
				<PortfolioCardTitle>{t('dashboard.your-portfolio.title')}</PortfolioCardTitle>
				<PortfolioCard>
					<StyledCurrencyPrice
						currencyKey={selectedPriceCurrency.name}
						price={synthBalances?.totalUSDBalance ?? 0}
						conversionRate={selectPriceCurrencyRate}
						sign={selectedPriceCurrency.sign}
					/>
					<Title>{t('common.totals.total-synth-value')}</Title>
				</PortfolioCard>
			</Totals>
			<StyledTabList>
				<TabButton
					name={TABS.SYNTH_BALANCES}
					active={activeTab === TABS.SYNTH_BALANCES}
					onClick={() => router.push(TABS.SYNTH_BALANCES)}
				>
					{t('dashboard.tabs.nav.synth-balances')}
				</TabButton>
				<TabButton
					name={TABS.CONVERT}
					active={activeTab === TABS.CONVERT}
					onClick={() => router.push(TABS.CONVERT)}
				>
					{t('dashboard.tabs.nav.convert')}
				</TabButton>
				<TabButton
					name={TABS.TRANSACTIONS}
					active={activeTab === TABS.TRANSACTIONS}
					onClick={() => router.push(TABS.TRANSACTIONS)}
				>
					{t('dashboard.tabs.nav.transactions')}
				</TabButton>
			</StyledTabList>
			<TabPanel name={TABS.SYNTH_BALANCES} activeTab={activeTab}>
				<SynthBalances
					balances={synthBalances?.balances ?? []}
					totalUSDBalance={synthBalances?.totalUSDBalance ?? 0}
					exchangeRates={exchangeRates}
					{...selectPriceCurrencyProps}
				/>
			</TabPanel>
			<TabPanel name={TABS.CONVERT} activeTab={activeTab}>
				<ConvertContainer>
					<CurrencyConvertCard />
				</ConvertContainer>
			</TabPanel>
			<TabPanel name={TABS.TRANSACTIONS} activeTab={activeTab}>
				<Transactions {...selectPriceCurrencyProps} />
			</TabPanel>
		</>
	);
};

const PortfolioCardTitle = styled(CardTitle)`
	margin-bottom: 12px;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	padding-bottom: 5px;
`;

const PortfolioCard = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	border-radius: 4px;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 24px;
	display: grid;
	grid-gap: 10px;
	justify-items: center;
`;

const Title = styled(BoldText)`
	text-transform: uppercase;
`;

const StyledCurrencyPrice = styled(Currency.Price)`
	font-size: 20px;
	color: ${(props) => props.theme.colors.white};
`;

const StyledTabList = styled(TabList)`
	margin-bottom: 12px;
`;

const Totals = styled.div`
	padding-bottom: 30px;
`;

export default DashboardCard;
