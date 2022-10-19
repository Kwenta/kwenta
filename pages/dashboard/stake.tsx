import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { StakingContext } from 'contexts/StakingContext';
import useStakingData from 'hooks/useStakingData';
import DashboardLayout from 'sections/dashboard/DashboardLayout';
import StakingPortfolio from 'sections/dashboard/Stake/StakingPortfolio';
import StakingTabs from 'sections/dashboard/Stake/StakingTabs';

type StakingComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const StakingPage: StakingComponent = () => {
	const { t } = useTranslation();
	const stakingData = useStakingData();

	return (
		<StakingContext.Provider value={stakingData}>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<StakingPortfolio />
			<StakingTabs />
		</StakingContext.Provider>
	);
};

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default StakingPage;
