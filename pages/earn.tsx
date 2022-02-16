import { FC } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';

import AppLayout from 'sections/shared/Layout/AppLayout';

import { PageContent, FullHeightContainer, MainContent, RightSideContent } from 'styles/common';
import { useTranslation } from 'react-i18next';
import { InfoGridContainer, Column, SplitColumn } from 'sections/earn/InfoGrid/InfoGrid';

import * as Text from 'components/Text';
import Button from 'components/Button';

const Earn = () => {
	return (
		<>
			<Head>
				<title>Earn</title>
			</Head>
			<AppLayout>
				<PageContent>
					<FullHeightContainer>
						<MainContent>
							<InfoGridContainer>
								<Column>
									<Title>Your Liquidity</Title>
									<StyledButton size="sm">
										Add Liquidity <span style={{ height: '4px' }}>↗</span>
									</StyledButton>
								</Column>
								<SplitColumn>
									<div>
										<Title>Yield / $1K / Day</Title>
									</div>
									<div>
										<Title>Your Rewards</Title>
									</div>
								</SplitColumn>
								<SplitColumn>
									<div>
										<Title>Time Remaining</Title>
									</div>
									<div>
										<Title>Last Snapshot</Title>
									</div>
								</SplitColumn>
							</InfoGridContainer>
						</MainContent>
					</FullHeightContainer>
				</PageContent>
			</AppLayout>
		</>
	);
};

const Title = styled(Text.Body)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 15px;
	margin-bottom: 10px;
`;

const StyledButton = styled(Button)`
	font-size: 13px;
`;

export default Earn;
