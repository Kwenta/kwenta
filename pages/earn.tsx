import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';

import AppLayout from 'sections/shared/Layout/AppLayout';

import { PageContent, FullHeightContainer, MainContent } from 'styles/common';
import { InfoGridContainer, Column, SplitColumn } from 'sections/earn/InfoGrid/InfoGrid';

import snxLogo from 'assets/svg/earn/SNX.svg';
import kwentaLogo from 'assets/svg/earn/KWENTA.svg';

import * as Text from 'components/Text';
import Button from 'components/Button';
import { Svg } from 'react-optimized-image';

const Earn: React.FC = () => {
	return (
		<>
			<Head>
				<title>Earn | Kwenta</title>
			</Head>
			<AppLayout>
				<PageContent>
					<FullHeightContainer>
						<MainContent>
							<PageHeading variant="h4">Liquidity Mining Program</PageHeading>
							<StyledBody>
								Earn KWENTA by staking SNX or adding liquidity to the sUSD Curve pool on Optimism.
							</StyledBody>
							<StyledHeading variant="h4">OVM SNX Stakers</StyledHeading>
							<InfoGridContainer style={{ marginBottom: 50 }}>
								<Column>
									<ColumnInner>
										<div>
											<Title>Your Liquidity</Title>
											<div style={{ display: 'flex', alignItems: 'center' }}>
												<BigText>2923.39</BigText>
												<Svg src={snxLogo} style={{ marginLeft: 9, marginRight: 9 }} />
												<DollarValue>$32,284.31</DollarValue>
											</div>
											<LiquidityText>
												Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat, faucibus
												et in risus.
											</LiquidityText>
										</div>
										<div>
											<StyledButton size="sm">Add Liquidity ↗</StyledButton>
										</div>
									</ColumnInner>
								</Column>
								<SplitColumn>
									<div>
										<Title>Yield / $1K / Day</Title>
										<KwentaText>28.12</KwentaText>
									</div>
									<div>
										<Title>Your Rewards</Title>
										<KwentaText>734.72</KwentaText>
									</div>
								</SplitColumn>
								<SplitColumn>
									<div>
										<Title>Time Remaining</Title>
										<BigText>16D:24H:18M</BigText>
									</div>
									<div>
										<Title>Last Snapshot</Title>
										<BigText>2H Ago</BigText>
									</div>
								</SplitColumn>
							</InfoGridContainer>

							<StyledHeading variant="h4">OVM sUSD Curve LP</StyledHeading>
							<InfoGridContainer>
								<Column>
									<ColumnInner>
										<div>
											<Title>Your Liquidity</Title>
											<div style={{ display: 'flex' }}>
												<BigText>$8,923.22</BigText>
											</div>
											<LiquidityText>
												Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat, faucibus
												et in risus.
											</LiquidityText>
										</div>
										<div>
											<StyledButton size="sm">Add Liquidity ↗</StyledButton>
										</div>
									</ColumnInner>
								</Column>
								<SplitColumn>
									<div>
										<Title>Yield / $1K / Day</Title>
										<KwentaText>28.12</KwentaText>
									</div>
									<div>
										<Title>Your Rewards</Title>
										<KwentaText>734.72</KwentaText>
									</div>
								</SplitColumn>
								<SplitColumn>
									<div>
										<Title>Time Remaining</Title>
										<BigText>16D:24H:18M</BigText>
									</div>
									<div>
										<Title>Last Snapshot</Title>
										<BigText>2H Ago</BigText>
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

const KwentaText: React.FC = ({ children }) => {
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<GoldText>{children}</GoldText>
			<Svg src={kwentaLogo} />
		</div>
	);
};

const PageHeading = styled(Text.Heading)`
	font-size: 21px;
	margin-bottom: 11px;
`;

const StyledHeading = styled(Text.Heading)`
	font-size: 21px;
	margin-bottom: 16px;
`;

const StyledBody = styled(Text.Body)`
	font-size: 16px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	margin-bottom: 40px;
`;

const Title = styled(Text.Body)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 14px;
	margin-bottom: 10px;
`;

const StyledButton = styled(Button)`
	font-size: 13px;
	height: 38px;
`;

const BigText = styled(Text.Heading)`
	font-size: 25px;
`;

const GoldText = styled(BigText)`
	color: ${(props) => props.theme.colors.common.primaryGold};
	margin-right: 8px;
`;

const DollarValue = styled(BigText)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const LiquidityText = styled(Text.Body)`
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const ColumnInner = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
`;

export default Earn;
