import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import ShortingCard from 'sections/shorting/ShortingCard';
import ShortingHistory from 'sections/shorting/ShortingHistory';
import ShortingRewards from 'sections/shorting/ShortingRewards';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { PageContent } from 'styles/common';
import media from 'styles/media';
import { SYNTHS_MAP } from 'constants/currency';
import { FlexDivRow } from 'styles/common';

const Shorting: FC = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('shorting.page-title')}</title>
			</Head>
			<AppLayout>
				<StyledPageContent>
					<ShortingCard />
					<FlexDivRow>
						<ShortingRewards synth={SYNTHS_MAP.sETH} />
						<ShortingRewards synth={SYNTHS_MAP.sBTC} />
					</FlexDivRow>
					<ShortingHistory />
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
