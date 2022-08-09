import Head from 'next/head';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { RefetchProvider } from 'contexts/RefetchContext';
import DashboardLayout from 'sections/dashboard/DashboardContainer/DashboardLayout';
import Overview from 'sections/dashboard/Overview';

type DashboardComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Dashboard: DashboardComponent = () => {
	const { t } = useTranslation();

	return (
		<RefetchProvider>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Overview />
		</RefetchProvider>
	);
};

Dashboard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Dashboard;
