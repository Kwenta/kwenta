import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import ShortingCard from 'sections/shorting/ShortingCard';
import ShortingHistory from 'sections/shorting/ShortingHistory';
import ShortingRewards from 'sections/shorting/ShortingRewards';

import AppLayout from 'sections/shared/Layout/AppLayout';
import { GridDiv, PageContent } from 'styles/common';
import media from 'styles/media';

import { SYNTHS_MAP } from 'constants/currency';

import { isWalletConnectedState } from 'store/wallet';

const Shorting: FC = () => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	return (
		<>
			<Head>
				<title>{t('shorting.page-title')}</title>
			</Head>
			<AppLayout>
				<StyledPageContent>
					<ShortingCard />
					<ShortingRewardsContainer>
						<ShortingRewards currencyKey={SYNTHS_MAP.sETH} />
						<ShortingRewards currencyKey={SYNTHS_MAP.sBTC} />
					</ShortingRewardsContainer>
					{isWalletConnected && <ShortingHistory />}
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

const ShortingRewardsContainer = styled(GridDiv)`
	grid-gap: 24px;
	grid-auto-flow: column;
	${media.lessThan('md')`
		grid-auto-flow: row;
		/* TODO: this is kinda ugly, and basically undoing the spacing that comes from the TradeSummaryCard */
		margin-top: -62px;
	`}
`;

export default Shorting;
