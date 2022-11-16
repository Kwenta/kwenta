import Head from 'next/head';
import { FC } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import Text from 'components/Text';
import DashboardLayout from 'sections/dashboard/DashboardLayout';
import StakeGrid from 'sections/earn/Grids/StakeGrid';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { PageContent, FullHeightContainer, MainContent } from 'styles/common';
import media from 'styles/media';

type EarnPageProps = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const EarnPage: EarnPageProps = () => {
	return (
		<>
			<Head>
				<title>Earn | Kwenta</title>
			</Head>
			<PageContent>
				<FullHeightContainer>
					<EarnContent>
						<PageHeading>Kwenta Liquidity Mining</PageHeading>
						<StyledBody>
							The ETH/KWENTA program rewards liquidity providers on the Uniswap v3 pool via Arrakis
							Finance. Liquidity providers can stake their pool tokens to earn KWENTA.
						</StyledBody>
						<StakeGrid />
						<GitHashID />
					</EarnContent>
				</FullHeightContainer>
			</PageContent>
		</>
	);
};

EarnPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

const EarnContent = styled(MainContent)`
	${media.lessThan('mdUp')`
		padding: 15px 15px 0;
	`}
`;

const PageHeading = styled(Text.Heading).attrs({ variant: 'h4' })`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 21px;
	margin-bottom: 4px;
	text-transform: uppercase;
	font-variant: all-small-caps;
`;

const StyledBody = styled(Text.Body).attrs({ size: 'large' })`
	font-size: 15px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin-bottom: 40px;
`;

export const StyledButton = styled(Button)`
	font-size: 13px;
	height: 38px;
`;

export default EarnPage;
