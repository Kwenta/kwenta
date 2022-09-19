import Head from 'next/head';
import React from 'react';

import DashboardLayout from 'sections/dashboard/DashboardLayout';
import StakingPortfolio from 'sections/dashboard/staking/StakingPortfolio';
import StakingTabs from 'sections/dashboard/staking/StakingTabs';

type StakingComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const StakingPage: StakingComponent = () => {
	return (
		<>
			<Head>
				<title>Staking | Kwenta</title>
			</Head>
			<div>
				<StakingPortfolio />
				<StakingTabs />
			</div>
		</>
	);
};

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default StakingPage;
