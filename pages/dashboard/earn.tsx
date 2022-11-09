import Head from 'next/head';
import { FC } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import Text from 'components/Text';
import DashboardLayout from 'sections/dashboard/DashboardLayout';
import PoolGrid from 'sections/earn/Grids/PoolGrid';
import StakeGrid from 'sections/earn/Grids/StakeGrid';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { PageContent, FullHeightContainer } from 'styles/common';

type EarnPageProps = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const EarnPage: EarnPageProps = () => {
	return (
		<>
			<Head>
				<title>Earn | Kwenta</title>
			</Head>
			<PageContent>
				<FullHeightContainer>
					<MainContainer>
						<EmptyColumn />
						<GridsContainer>
							<PageHeading>Liquidity Mining Program</PageHeading>
							<StyledBody>
								Earn KWENTA by staking SNX or adding liquidity to the sUSD Curve pool on Optimism.
							</StyledBody>
							<StakeGrid />
							<PoolGrid />
						</GridsContainer>
						<GitHashID />
					</MainContainer>
				</FullHeightContainer>
			</PageContent>
		</>
	);
};

EarnPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

const PageHeading = styled(Text.Heading).attrs({ variant: 'h4' })`
	font-size: 21px;
	margin-bottom: 2px;
`;

const StyledBody = styled(Text.Body).attrs({ size: 'large' })`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin-bottom: 40px;
`;

export const StyledButton = styled(Button)`
	font-size: 13px;
	height: 38px;
`;

const MainContainer = styled.div`
	position: relative;
	flex-grow: 1;
	display: flex;
	justify-content: space-between;
	width: 100%;
	max-width: 1440px;
	margin: 120px auto 0;
`;

const GridsContainer = styled.div`
	max-width: 915px;
`;

const EmptyColumn = styled.div`
	width: 174px;
`;

export default EarnPage;
