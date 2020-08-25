import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('not-found.page-title')}</title>
			</Head>
			<div>Not Found</div>
		</>
	);
};

export default NotFoundPage;
