import Head from 'next/head';
import React from 'react';

import DashboardLayout from 'sections/dashboard/DashboardLayout';

type StakingComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const StakingPage: StakingComponent = () => {
	return (
		<>
			<Head>
				<title>Token | Kwenta</title>
			</Head>
		</>
	);
};

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
