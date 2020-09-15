import { useState } from 'react';
import styled from 'styled-components';
import synthetix, { Synth } from 'lib/synthetix';
import { useRecoilValue } from 'recoil';

import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { priceCurrencyState } from 'store/app';

import { FlexDiv, FlexDivCol, SelectableCurrencyRow, FlexDivRow } from 'styles/common';
import { TabList, TabPanel, TabButton } from 'components/Tab';
import useSynthsBalancesQuery, {
	SynthBalance,
} from 'queries/walletBalances/useSynthsBalancesQuery';
import Select from 'components/Select';
import Currency from 'components/Currency';
import ProgressBar from 'components/ProgressBar';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { fonts } from 'styles/theme/fonts';
import Button from 'components/Button';
import ComingSoonBalanceChart from 'components/ComingSoonBalanceChart';
import { NO_VALUE } from 'constants/placeholder';
import { formatCurrency } from 'utils/formatters/number';

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
		<>
			{synthsBalancesQuery.isSuccess &&
				synthsBalancesQuery.data.balances.map((synth: SynthBalance) => {
					const percent =
						Math.floor(synth.usdBalance / synthsBalancesQuery.data.totalUSDBalance) * 100;
					const synthDesc =
						synthetix.synthsMap != null ? synthetix.synthsMap[synth.currencyKey]?.desc : '';
					return (
						<SynthBalanceRow key={synth.currencyKey}>
							<div>
								<Currency.Name currencyKey={synth.currencyKey} name={synthDesc} showIcon={true} />
							</div>
							<div>
								<Currency.Amount
									currencyKey={synth.currencyKey}
									amount={synth.balance}
									totalValue={synth.usdBalance}
									sign={selectedPriceCurrency.sign}
								/>
							</div>
							<div>
								{exchangeRatesQuery.data !== undefined && (
									<Currency.Price
										currencyKey={synth.currencyKey}
										price={exchangeRatesQuery.data[synth.currencyKey]}
										sign={selectedPriceCurrency.sign}
									/>
								)}
							</div>
							<SynthBalancePercentRow>
								<ProgressBar percentage={percent} />
								<TypeDataSmall>{percent >= 1 ? percent : '<1'}%</TypeDataSmall>
							</SynthBalancePercentRow>
						</SynthBalanceRow>
					);
				})}
		</>
	);
};

const TypeDataSmall = styled.div`
	${fonts.data.small}
	margin-top: 5px;
`;

const SynthBalancePercentRow = styled.div`
	align-items: center;
	min-width: 112px;
`;

const SynthBalanceRow = styled(FlexDivRow)`
	background: ${(props) => props.theme.colors.elderberry};
	padding: 12px 22px 12px 16px;
	margin-top: 2px;
	align-items: center;
`;

const DashboardPage = () => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState(TABS.SYNTH_BALANCES);
	const exchangeRatesQuery = useExchangeRatesQuery({ refetchInterval: false });
	const synthsBalancesQuery = useSynthsBalancesQuery({ enabled: exchangeRatesQuery.isSuccess });
	const noSynths = !synthsBalancesQuery.data || synthsBalancesQuery.data.balances.length === 0;
	const synths = synthetix.js?.synths ?? [];
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);

	const SYNTH_SORT_OPTIONS = [{ label: t('dashboard.synthSort.price'), value: 'PRICE' }];
	const [currentSynthSort, setCurrentSynthSort] = useState(SYNTH_SORT_OPTIONS[0]);
	const profit = formatCurrency(
		selectedPriceCurrency.name,
		synthsBalancesQuery.data?.totalUSDBalance || 0,
		{
			sign: selectedPriceCurrency.sign,
		}
	);

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Container>
				<LeftContainer>
					{noSynths ? (
						<NoSynthsCard />
					) : (
						<DashboardLeftCol>
							<FlexDivCol style={{ minHeight: '160px', marginBottom: '26px' }}>
								<DashboardTitle>{t('dashboard.your-profile.title')}</DashboardTitle>
								<Profit>{profit}</Profit>
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
								<TabPanel name={TABS.CONVERT} activeTab={activeTab}>
									<ComingSoon>{t('common.features.coming-soon')}</ComingSoon>
								</TabPanel>
								<TabPanel name={TABS.CRYPTO_BALANCES} activeTab={activeTab}>
									<ComingSoon>{t('common.features.coming-soon')}</ComingSoon>
								</TabPanel>
								<TabPanel name={TABS.TRANSACTIONS} activeTab={activeTab}>
									<ComingSoon>{t('common.features.coming-soon')}</ComingSoon>
								</TabPanel>
							</FlexDivCol>
						</DashboardLeftCol>
					)}
				</LeftContainer>
				<RightContainer>
					<FlexDivRow>
						<CardTitle>{t('dashboard.trending')}</CardTitle>
						<Select
							formatOptionLabel={(option) => <span>{option.label}</span>}
							options={SYNTH_SORT_OPTIONS}
							value={currentSynthSort}
							onChange={(option: any) => {
								if (option) {
									setCurrentSynthSort(option);
								}
							}}
						/>
					</FlexDivRow>
					{synths.map((synth: Synth) => {
						const selectPriceCurrencyRate =
							exchangeRatesQuery.data && exchangeRatesQuery.data[selectedPriceCurrency.name];
						let price = exchangeRatesQuery.data && exchangeRatesQuery.data[synth.name];
						const currencyKey = synth.name;

						if (price != null && selectPriceCurrencyRate != null) {
							price /= selectPriceCurrencyRate;
						}
						return (
							<SelectableCurrencyRow key={currencyKey} isSelectable={true}>
								<Currency.Name currencyKey={currencyKey} name={synth.desc} showIcon={true} />
								{price != null ? (
									<Currency.Price
										currencyKey={currencyKey}
										price={price}
										sign={selectedPriceCurrency.sign}
									/>
								) : (
									NO_VALUE
								)}
							</SelectableCurrencyRow>
						);
					})}
				</RightContainer>
			</Container>
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

const DashboardLeftCol = styled(FlexDivCol)`
	max-width: 686px;
`;

const CardTitle = styled.div`
	${fonts.body['bold-medium']}
	color: ${(props) => props.theme.colors.white};
`;

const Container = styled(FlexDiv)`
	justify-content: space-between;
	align-items: start;
	width: 100%;
	flex-grow: 1;
`;

const LeftContainer = styled(FlexDivCol)`
	flex-grow: 1;
	max-width: 1000px;
	padding-bottom: 48px;
	margin: 0px 75px;
`;

const RightContainer = styled(FlexDivCol)`
	width: 356px;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 0px 32px 48px 32px;
`;

const NoSynthTitle = styled.div`
	${fonts.data.small}
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

const NoSynthsCard = () => {
	const { t } = useTranslation();
	return (
		<FlexDivCol>
			<NoSynthTitle>{t('dashboard.no-synths-card.title')}</NoSynthTitle>
			<NoSynthSubtitle>{t('dashboard.no-synths-card.subtitle')}</NoSynthSubtitle>
			<Center>
				<Button variant="primary" isRounded={true} size="lg">
					{t('dashboard.no-synths-card.learnMore')}
				</Button>
			</Center>
			<CardTitle>{t('dashboard.no-synths-card.convert')}</CardTitle>
		</FlexDivCol>
	);
};

export default DashboardPage;
