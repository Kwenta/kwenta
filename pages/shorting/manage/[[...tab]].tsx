import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import ManageShort from 'sections/shorting/ManageShort';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { PageContent } from 'styles/common';
import media from 'styles/media';

const Shorting: FC = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('shorting.page-title')}</title>
			</Head>
			<AppLayout>
				<StyledPageContent>
					<ManageShort />
				</StyledPageContent>
			</AppLayout>
		</>
	);
};

const StyledPageContent = styled(PageContent)`
	padding-top: 55px;
	${media.greaterThan('md')`
		max-width: 1000px;
	`}
`;

export default Shorting;
