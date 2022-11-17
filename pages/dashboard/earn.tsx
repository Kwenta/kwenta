import Head from 'next/head';
import { FC } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import Text from 'components/Text';
import DashboardLayout from 'sections/dashboard/DashboardLayout';
import { Heading } from 'sections/earn/common';
import StakeGrid from 'sections/earn/Grids/StakeGrid';
import StepOne from 'sections/earn/StepOne';
import StepTwo from 'sections/earn/StepTwo';
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
						<Heading>Kwenta Liquidity Mining</Heading>
						<StyledBody>
							The ETH/KWENTA program rewards liquidity providers on the Uniswap v3 pool via Arrakis
							Finance. Liquidity providers can stake their pool tokens to earn KWENTA.
						</StyledBody>
						<StepOne />
						<StepTwo />
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

const StyledBody = styled(Text.Body).attrs({ size: 'large' })`
	font-size: 15px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

export const StyledButton = styled(Button)`
	font-size: 13px;
	height: 38px;
`;

export default EarnPage;
