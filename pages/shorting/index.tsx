import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import ShortingCard from 'sections/shorting/ShortingCard';
import ShortingHistory from 'sections/shorting/ShortingHistory';
import ShortingRewards from 'sections/shorting/ShortingRewards';
import ShortingStats from 'sections/shorting/ShortingStats';
import { SYNTHS_TO_SHORT } from 'sections/shorting/constants';

import AppLayout from 'sections/shared/Layout/AppLayout';

import {
	GridDiv,
	PageContent,
	MainContent,
	RightSideContent,
	FullHeightContainer,
} from 'styles/common';
import media from 'styles/media';

import { DesktopOnlyView } from 'components/Media';

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
				<PageContent>
					<FullHeightContainer>
						<MainContent>
							<ShortingCard />
							<ShortingRewardsContainer>
								{SYNTHS_TO_SHORT.map((currencyKey) => (
									<ShortingRewards key={currencyKey} currencyKey={currencyKey} />
								))}
							</ShortingRewardsContainer>
							{isWalletConnected && <ShortingHistory />}
						</MainContent>
						<DesktopOnlyView>
							<StyledRightSideContent>
								<ShortingStats />
							</StyledRightSideContent>
						</DesktopOnlyView>
					</FullHeightContainer>
				</PageContent>
			</AppLayout>
		</>
	);
};

const ShortingRewardsContainer = styled(GridDiv)`
	grid-gap: 24px;
	grid-auto-flow: column;
	${media.lessThan('md')`
		grid-auto-flow: row;
		/* TODO: this is kinda ugly, and basically undoing the spacing that comes from the TradeSummaryCard */
		margin-top: -62px;
	`}
`;

const StyledRightSideContent = styled(RightSideContent)`
	padding-left: 32px;
	padding-right: 32px;
`;

export default Shorting;
