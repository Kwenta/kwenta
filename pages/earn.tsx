import Head from 'next/head';
import React from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import Text from 'components/Text';
import PoolGrid from 'sections/earn/Grids/PoolGrid';
import StakeGrid from 'sections/earn/Grids/StakeGrid';
import Rewards from 'sections/earn/Rewards/Rewards';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { PageContent, FullHeightContainer } from 'styles/common';

const Earn: React.FC = () => {
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
							<PageHeading variant="h4">Liquidity Mining Program</PageHeading>
							<StyledBody size="large">
								Earn KWENTA by staking SNX or adding liquidity to the sUSD Curve pool on Optimism.
							</StyledBody>
							<StakeGrid />
							<PoolGrid />
						</GridsContainer>
						<Rewards />
						<GitHashID />
					</MainContainer>
				</FullHeightContainer>
			</PageContent>
		</>
	);
};

const PageHeading = styled(Text.Heading)`
	font-size: 21px;
	margin-bottom: 2px;
`;

const StyledBody = styled(Text.Body)`
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

export default Earn;
