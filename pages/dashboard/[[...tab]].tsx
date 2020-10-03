import styled from 'styled-components';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { FlexDiv, FlexDivCol, PageContent, MobileContainerMixin } from 'styles/common';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Loader from 'components/Loader';

import AppLayout from 'sections/shared/Layout/AppLayout';
import DashboardCard from 'sections/dashboard/DashboardCard';
import TrendingSynths from 'sections/dashboard/TrendingSynths';
import Onboard from 'sections/dashboard/Onboard';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { isWalletConnectedState } from 'store/wallet';
import { priceCurrencyState } from 'store/app';

const DashboardPage = () => {
	const { t } = useTranslation();

	const synthsBalancesQuery = useSynthsBalancesQuery();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);

	const exchangeRates = exchangeRatesQuery.data ?? null;
	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	const selectPriceCurrencyProps = {
		selectedPriceCurrency,
		selectPriceCurrencyRate,
	};

	// TODO: refactor activeView with better logic, this is kinda broken at the moment.

	let activeView = <Loader />;

	if (isWalletConnected) {
		if (synthsBalancesQuery.isSuccess) {
			const noSynths = synthsBalancesQuery.data
				? synthsBalancesQuery.data.balances.length === 0
				: false;

			activeView = noSynths ? (
				<Onboard />
			) : (
				<DashboardCard exchangeRates={exchangeRates} {...selectPriceCurrencyProps} />
			);
		}
	} else {
		activeView = <Onboard />;
	}

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<AppLayout>
				<PageContent>
					<DesktopOnlyView>
						<Container>
							<LeftContainer>{activeView}</LeftContainer>
							<RightContainer>
								<TrendingSynths exchangeRates={exchangeRates} {...selectPriceCurrencyProps} />
							</RightContainer>
							<BottomShadow />
						</Container>
					</DesktopOnlyView>
					<MobileOrTabletView>
						<MobileContainer>{activeView}</MobileContainer>
					</MobileOrTabletView>
				</PageContent>
			</AppLayout>
		</>
	);
};

const SPACING_FROM_HEADER = '80px';

const MobileContainer = styled.div`
	${MobileContainerMixin};
	padding-top: 90px;
`;

const Container = styled(FlexDiv)`
	justify-content: space-between;
	width: 100%;
	flex-grow: 1;
	height: 100vh;
	position: relative;
`;

const LeftContainer = styled(FlexDivCol)`
	flex-grow: 1;
	max-width: 1000px;
	position: relative;
	overflow: auto;
	margin: ${SPACING_FROM_HEADER} auto 0 auto;
`;

const RightContainer = styled(FlexDivCol)`
	width: 340px;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: ${SPACING_FROM_HEADER} 0 5px 0;
	margin-right: -20px;
	flex-shrink: 0;
	position: relative;
	margin-left: 20px;
`;

const BottomShadow = styled.div`
	background: linear-gradient(360deg, #10101e 0%, rgba(16, 16, 30, 0) 100%);
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 16px;
	pointer-events: none;
`;

export default DashboardPage;
