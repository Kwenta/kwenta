import { useState, useMemo } from 'react';
import styled from 'styled-components';
import synthetix, { Synth } from 'lib/synthetix';
import { useRecoilValue } from 'recoil';

import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { priceCurrencyState } from 'store/app';

import { FlexDiv, FlexDivCol, SelectableCurrencyRow, FlexDivRow, PageContent } from 'styles/common';
import { TabList, TabPanel, TabButton } from 'components/Tab';
import useSynthsBalancesQuery, {
	SynthBalance,
} from 'queries/walletBalances/useSynthsBalancesQuery';
import TradeHistory from 'components/TradeHistory';
import Select from 'components/Select';
import Currency from 'components/Currency';
import ProgressBar from 'components/ProgressBar';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useAllTradesQuery from 'queries/trades/useAllTradesQuery';
import { fonts } from 'styles/theme/fonts';
import Button from 'components/Button';
import ComingSoonBalanceChart from 'components/ComingSoonBalanceChart';
import { NO_VALUE } from 'constants/placeholder';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { CATEGORY_MAP } from 'constants/currency';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

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

const Transactions = () => {
	const { t } = useTranslation();
	const allTradesQuery = useAllTradesQuery();

	const synthFilterList = [
		{ label: t('dashboard.transactions.synthSort.allSynths'), key: 'ALL_SYNTHS' },
		{ label: t('common.currency-category.crypto'), key: CATEGORY_MAP['crypto'] },
		{ label: t('common.currency-category.forex'), key: CATEGORY_MAP['forex'] },
		{ label: t('common.currency-category.commodity'), key: CATEGORY_MAP['commodity'] },
		{ label: t('common.currency-category.equities'), key: CATEGORY_MAP['equities'] },
	];
	const [synthFilter, setSynthFilter] = useState(synthFilterList[0]);
	const orderTypeList = [
		{ label: t('dashboard.transactions.orderTypeSort.allOrderTypes'), key: 'ALL_ORDER_TYPES' },
		{ label: t('dashboard.transactions.orderTypeSort.market'), key: 'MARKET' },
		/* { label: t('dashboard.transactions.orderTypeSort.limit'), key: 'LIMIT' }, */
	];
	const [orderType, setOrderType] = useState(orderTypeList[0]);

	const orderSizeList = [{ label: 'All Sizes', key: 'ALL_ORDER_SIZES' }];
	const [orderSize, setOrderSize] = useState(orderSizeList[0]);

	const synths = synthetix.js?.synths || [];
	const filteredSynthKeys = useMemo(
		() => synths.filter((synth) => synth.category === synthFilter.key).map((synth) => synth.name),
		[synths, synthFilter.key]
	);

	const trades = allTradesQuery.data || [];
	const filteredHistoricalTrades = useMemo(
		() =>
			synthFilter.key !== 'ALL_SYNTHS'
				? trades.filter((trade) => filteredSynthKeys.indexOf(trade.fromCurrencyKey) !== -1)
				: trades,
		[trades, filteredSynthKeys, synthFilter.key]
	);

	return (
		<>
			<FlexDivRow>
				<TransactionSelect
					formatOptionLabel={(option: any) => <Capitalize>{option.label}</Capitalize>}
					options={synthFilterList}
					value={synthFilter}
					onChange={(option: any) => {
						if (option) {
							setSynthFilter(option);
						}
					}}
				/>
				<TransactionSelect
					formatOptionLabel={(option: any) => <Capitalize>{option.label}</Capitalize>}
					options={orderTypeList}
					value={orderType}
					onChange={(option: any) => {
						if (option) {
							setOrderType(option);
						}
					}}
				/>
				<TransactionSelect
					formatOptionLabel={(option: any) => <Capitalize>{option.label}</Capitalize>}
					options={orderSizeList}
					value={orderSize}
					onChange={(option: any) => {
						if (option) {
							setOrderSize(option);
						}
					}}
				/>
			</FlexDivRow>
			<FlexDivRow>
				<TradeHistory
					trades={filteredHistoricalTrades}
					isLoaded={allTradesQuery.isSuccess}
					isLoading={allTradesQuery.isLoading}
				/>
			</FlexDivRow>
		</>
	);
};

const TransactionSelect = styled(Select)`
	width: 33%;
	max-width: 217px;
`;

const Capitalize = styled.span`
	text-transform: capitalize;
`;

const Dashboard = () => {
	const { t } = useTranslation();
	const exchangeRatesQuery = useExchangeRatesQuery({ refetchInterval: false });
	const synthsBalancesQuery = useSynthsBalancesQuery({ enabled: exchangeRatesQuery.isSuccess });
	const noSynths = !synthsBalancesQuery.data || synthsBalancesQuery.data.balances.length === 0;

	const [activeTab, setActiveTab] = useState(TABS.SYNTH_BALANCES);
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);

	return noSynths ? (
		<NoSynthsCard />
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
					<Transactions />
				</TabPanel>
			</FlexDivCol>
		</>
	);
};

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

const TrendingSynths = () => {
	const { t } = useTranslation();

	const SYNTH_SORT_OPTIONS = [{ label: t('dashboard.synthSort.price'), value: 'PRICE' }];
	const [currentSynthSort, setCurrentSynthSort] = useState(SYNTH_SORT_OPTIONS[0]);

	const synths = synthetix.js?.synths ?? [];
	const exchangeRatesQuery = useExchangeRatesQuery({ refetchInterval: false });
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);

	return (
		<>
			<FlexDivRow>
				<CardTitle>{t('dashboard.trending')}</CardTitle>
				<TrendingSortSelect
					formatOptionLabel={(option: any) => <span>{option.label}</span>}
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
								currencyKey={selectedPriceCurrency.name}
								price={price}
								sign={selectedPriceCurrency.sign}
							/>
						) : (
							NO_VALUE
						)}
					</SelectableCurrencyRow>
				);
			})}
		</>
	);
};

const DashboardPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<AppLayout>
				<PageContent>
					<DesktopOnlyView>
						<Container>
							<LeftContainer>
								<Dashboard />
							</LeftContainer>
							<RightContainer>
								<TrendingSynths />
							</RightContainer>
						</Container>
					</DesktopOnlyView>
					<MobileOrTabletView>
						<MobileContainer>
							<Dashboard />
						</MobileContainer>
					</MobileOrTabletView>
				</PageContent>
			</AppLayout>
		</>
	);
};

const MobileContainer = styled.div`
	max-width: 364px;
`;

const TrendingSortSelect = styled(Select)`
	width: 30%;
`;

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

const CardTitle = styled.div`
	${fonts.body['bold-medium']}
	color: ${(props) => props.theme.colors.white};
`;

const Container = styled(FlexDiv)`
	justify-content: space-between;
	width: 100%;
	flex-grow: 1;
`;

const LeftContainer = styled(FlexDivCol)`
	flex-grow: 1;
	padding-bottom: 48px;
	margin: 0px 75px;
	padding-top: 55px;
	max-width: 1000px;
`;

const RightContainer = styled(FlexDivCol)`
	width: 356px;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 55px 32px 48px 32px;
	margin-right: -20px;
`;

export default DashboardPage;
