import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';

import AppLayout from 'sections/shared/Layout/AppLayout';

import { PageContent, FullHeightContainer } from 'styles/common';

import Text from 'components/Text';
import Button from 'components/Button';
import Rewards from 'sections/earn/Rewards/Rewards';
import StakeGrid from 'sections/earn/Grids/StakeGrid';
import PoolGrid from 'sections/earn/Grids/PoolGrid';

const Earn: React.FC = () => {
	return (
		<>
			<Head>
				<title>Earn | Kwenta</title>
			</Head>
			<AppLayout>
				<PageContent>
					<FullHeightContainer>
						<MainContainer>
							<GridsContainer>
								<PageHeading variant="h4">Liquidity Mining Program</PageHeading>
								<StyledBody size="large">
									Earn KWENTA by staking SNX or adding liquidity to the sUSD Curve pool on Optimism.
								</StyledBody>
								<StakeGrid />
								<PoolGrid />
							</GridsContainer>
							<Rewards />
						</MainContainer>
					</FullHeightContainer>
				</PageContent>
			</AppLayout>
		</>
	);
};

const PageHeading = styled(Text.Heading)`
	font-size: 21px;
	margin-bottom: 11px;
`;

const StyledBody = styled(Text.Body)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	margin-bottom: 40px;
`;

export const StyledButton = styled(Button)`
	font-size: 13px;
	height: 38px;
`;

const MainContainer = styled.div`
	position: relative;
	flex-grow: 1;
	display: grid;
	width: 100%;
	max-width: 1440px;
	margin: 80px auto 0;
	padding: 0 30px;
	grid-template-columns: 174px 1fr 216px;
	grid-gap: 30px;
	grid-template-areas: '. main rsb';
`;

const GridsContainer = styled.div`
	grid-area: main;
`;

export default Earn;
