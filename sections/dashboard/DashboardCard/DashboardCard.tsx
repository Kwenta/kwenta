import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import { priceCurrencyState } from 'store/app';

import { TabList, TabPanel, TabButton } from 'components/Tab';
import Currency from 'components/Currency';
import Loader from 'components/Loader';
import ComingSoonBalanceChart from 'components/ComingSoonBalanceChart';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import SynthBalances from 'sections/dashboard/SynthBalances';
import Transactions from 'sections/dashboard/Transactions';

import { FlexDivCol } from 'styles/common';
import { fonts } from 'styles/theme/fonts';

const TABS = {
	SYNTH_BALANCES: 'synth-balances',
	CONVERT: 'convert',
	// CRYPTO_BALANCES: 'crypto-balances',
	TRANSACTIONS: 'transactions',
};

const DashboardCard = () => {
	const router = useRouter();
	const { tab } = router.query;
	const { t } = useTranslation();
	const exchangeRatesQuery = useExchangeRatesQuery({ refetchInterval: false });
	const synthsBalancesQuery = useSynthsBalancesQuery();

	const exchangeRates = exchangeRatesQuery.data ?? null;
	const activeTab = !!tab ? tab[0] : TABS.SYNTH_BALANCES;

	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	const selectPriceCurrencyProps = {
		selectedPriceCurrency,
		selectPriceCurrencyRate,
	};

	// TODO: temp workaround... synthsBalancesQuery is idle at first, and so we make sure to proceed only when this query is successful so we know which view to show.
	if (!synthsBalancesQuery.isSuccess) {
		return <Loader />;
	}

	return (
		<>
			<FlexDivCol style={{ minHeight: '160px', marginBottom: '26px', flexShrink: 0 }}>
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
			<TabList style={{ marginBottom: '12px' }}>
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
				{/*<TabButton
						name={TABS.CRYPTO_BALANCES}
						active={activeTab === TABS.CRYPTO_BALANCES}
						onClick={() => router.push(TABS.CRYPTO_BALANCES)}
					>
						{t('dashboard.tabs.nav.crypto-balances')}
				</TabButton>*/}
				<TabButton
					name={TABS.TRANSACTIONS}
					active={activeTab === TABS.TRANSACTIONS}
					onClick={() => router.push(TABS.TRANSACTIONS)}
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
		</>
	);
};

const ComingSoon = styled.div`
	${fonts.data.large}
	color: ${(props) => props.theme.colors.white};
	text-align: center;
`;

const DashboardTitle = styled.div`
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
	margin-bottom: 10px;
`;

const Profit = styled.div`
	${fonts.data.xLarge}
	color: ${(props) => props.theme.colors.white};
	margin-bottom: 70px;
`;

export default DashboardCard;
