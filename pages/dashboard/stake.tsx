import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';

import DashboardLayout from 'sections/dashboard/DashboardLayout';
import StakingPortfolio from 'sections/dashboard/Staking/StakingPortfolio';
import StakingTabs from 'sections/dashboard/Staking/StakingTabs';

type StakingComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const StakingPage: StakingComponent = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<StakingPortfolio />
			<StakingTabs />
		</>
	);
};

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default StakingPage;
