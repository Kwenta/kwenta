import { useState } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { priceCurrencyState } from 'store/app';

import { FlexDivCol } from 'styles/common';
import { TabList, TabPanel, TabButton } from 'components/Tab';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import Currency from 'components/Currency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import ComingSoonBalanceChart from 'components/ComingSoonBalanceChart';
import SynthBalances from 'sections/dashboard/SynthBalances';
import NoSynths from 'sections/dashboard/NoSynths';
import Transactions from 'sections/dashboard/Transactions';
import { fonts } from 'styles/theme/fonts';

const TABS = {
	SYNTH_BALANCES: 'synth-balances',
	CONVERT: 'convert',
	// CRYPTO_BALANCES: 'crypto-balances',
	TRANSACTIONS: 'transactions',
};

const DashboardCard = () => {
	const { t } = useTranslation();
	const exchangeRatesQuery = useExchangeRatesQuery({ refetchInterval: false });
	const synthsBalancesQuery = useSynthsBalancesQuery();

	const exchangeRates = exchangeRatesQuery.data ?? null;
	const [activeTab, setActiveTab] = useState(TABS.SYNTH_BALANCES);

	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	const noSynths = !synthsBalancesQuery.data || synthsBalancesQuery.data.balances.length === 0;

	const selectPriceCurrencyProps = {
		selectedPriceCurrency,
		selectPriceCurrencyRate,
	};

	return noSynths ? (
		<NoSynths />
	) : (
		<>
			<FlexDivCol style={{ minHeight: '160px', marginBottom: '26px' }}>
				<DashboardTitle>{t('dashboard.your-profile.title')}</DashboardTitle>
				<Profit>
					<Currency.Price
						currencyKey={selectedPriceCurrency.name}
						price={synthsBalancesQuery.data?.totalUSDBalance || 0}
						sign={selectedPriceCurrency.sign}
					/>
				</Profit>
				<ComingSoonBalanceChart />
			</FlexDivCol>
			<FlexDivCol>
				<TabList style={{ marginBottom: '12px' }}>
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
					{/*<TabButton
						name={TABS.CRYPTO_BALANCES}
						active={activeTab === TABS.CRYPTO_BALANCES}
						onClick={() => setActiveTab(TABS.CRYPTO_BALANCES)}
					>
						{t('dashboard.tabs.nav.crypto-balances')}
					</TabButton>*/}
					<TabButton
						name={TABS.TRANSACTIONS}
						active={activeTab === TABS.TRANSACTIONS}
						onClick={() => setActiveTab(TABS.TRANSACTIONS)}
					>
						{t('dashboard.tabs.nav.transactions')}
					</TabButton>
				</TabList>
				<TabPanel name={TABS.SYNTH_BALANCES} activeTab={activeTab}>
					<SynthBalances
						balances={synthsBalancesQuery.data?.balances ?? []}
						totalUSDBalance={synthsBalancesQuery.data?.totalUSDBalance ?? 0}
						exchangeRates={exchangeRates}
						{...selectPriceCurrencyProps}
					/>
				</TabPanel>
				<TabPanel name={TABS.CONVERT} activeTab={activeTab}>
					<ComingSoon>{t('common.features.coming-soon')}</ComingSoon>
				</TabPanel>
				{/*<TabPanel name={TABS.CRYPTO_BALANCES} activeTab={activeTab}>
					<ComingSoon>{t('common.features.coming-soon')}</ComingSoon>
				</TabPanel> */}
				<TabPanel name={TABS.TRANSACTIONS} activeTab={activeTab}>
					<Transactions />
				</TabPanel>
			</FlexDivCol>
		</>
	);
};

const ComingSoon = styled.div`
	${fonts.data.large}
	color: ${(props) => props.theme.colors.white};
	text-align: center;
`;

const DashboardTitle = styled.div`
	${fonts.data.large}
	color: ${(props) => props.theme.colors.white};
	margin-bottom: 4px;
`;

const Profit = styled.div`
	${fonts.data.xLarge}
	color: ${(props) => props.theme.colors.white};
	margin-bottom: 70px;
`;

export default DashboardCard;
