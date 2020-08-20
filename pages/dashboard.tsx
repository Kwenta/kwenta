import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const DashboardPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<div>Dashboard</div>
		</>
	);
};

export default DashboardPage;
