import Head from 'next/head';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { PageContent } from 'styles/common';

type AppLayoutProps = {
	children: React.ReactNode;
};

type LeaderComponent = FC & { layout: FC<AppLayoutProps> };

const Leader: LeaderComponent = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('futures.page-title')}</title>
			</Head>
			<PageContent>Hell ow</PageContent>
		</>
	);
};

Leader.layout = AppLayout;

export default Leader;
