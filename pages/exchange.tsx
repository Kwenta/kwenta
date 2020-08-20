import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const ExchangePage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('exchange.page-title')}</title>
			</Head>
			<div>Exchange</div>
		</>
	);
};

export default ExchangePage;
