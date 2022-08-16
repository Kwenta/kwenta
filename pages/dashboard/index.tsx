import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import DashboardLayout from 'sections/dashboard/DashboardLayout';
import Overview from 'sections/dashboard/Overview';

type DashboardComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Dashboard: DashboardComponent = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Overview />
		</>
	);
};

Dashboard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Dashboard;
