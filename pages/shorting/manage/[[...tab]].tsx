import { FC, useCallback, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import ManageShort from 'sections/shorting/ManageShort';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { PageContent } from 'styles/common';
import media from 'styles/media';
import ROUTES from 'constants/routes';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import { isL2MainnetState } from 'store/wallet';

const Shorting: FC = () => {
	const { t } = useTranslation();
	const isL2Mainnet = useRecoilValue(isL2MainnetState);
	const router = useRouter();

	const redirectToHome = useCallback(() => router.push(ROUTES.Dashboard.Home), [router]);

	useEffect(() => {
		if (isL2Mainnet) {
			redirectToHome();
		}
	}, [isL2Mainnet, redirectToHome]);

	return (
		<>
			<Head>
				<title>{t('shorting.page-title')}</title>
			</Head>
			<AppLayout>
				<StyledPageContent>{!isL2Mainnet && <ManageShort />}</StyledPageContent>
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
