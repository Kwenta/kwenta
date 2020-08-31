import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
		</>
	);
};

export default HomePage;
