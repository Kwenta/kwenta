import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import { Synth } from 'lib/synthetix';

import { TabList, TabPanel, TabButton } from 'components/Tab';
import Currency from 'components/Currency';

import { Balances } from 'queries/walletBalances/useSynthsBalancesQuery';
import { Rates } from 'queries/rates/useExchangeRatesQuery';

import SynthBalances from 'sections/dashboard/SynthBalances';
import Transactions from 'sections/dashboard/Transactions';
import CurrencyConvertCard from 'sections/dashboard/CurrencyConvertCard';

import { BoldText } from 'styles/common';

import { CardTitle, ConvertContainer } from '../common';

const TABS = {
	SYNTH_BALANCES: 'synth-balances',
	CONVERT: 'convert',
	TRANSACTIONS: 'transactions',
};

type DashboardCardProps = {
	exchangeRates: Rates | null;
	synthBalances: Balances | null;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
};

const DashboardCard: FC<DashboardCardProps> = ({
	exchangeRates,
	synthBalances,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
}) => {
	const { t } = useTranslation();
	const router = useRouter();
	const { tab } = router.query;

	const activeTab = !!tab ? tab[0] : TABS.SYNTH_BALANCES;

	const selectPriceCurrencyProps = {
		selectedPriceCurrency,
		selectPriceCurrencyRate,
	};

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
					<CurrencyConvertCard
						exchangeRates={exchangeRates}
						synthBalances={synthBalances}
						{...selectPriceCurrencyProps}
					/>
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
