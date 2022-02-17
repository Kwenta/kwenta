import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';

import AppLayout from 'sections/shared/Layout/AppLayout';

import { PageContent, FullHeightContainer } from 'styles/common';
import { InfoGridContainer, Column, SplitColumn } from 'sections/earn/InfoGrid/InfoGrid';

import Text from 'components/Text';
import Button from 'components/Button';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { BigText, KwentaText, Title, Description } from 'sections/earn/common';
import Rewards from 'sections/earn/Rewards/Rewards';

const Earn: React.FC = () => {
	return (
		<>
			<Head>
				<title>Earn | Kwenta</title>
			</Head>
			<AppLayout>
				<PageContent>
					<FullHeightContainer>
						<MainGrid>
							<div style={{ gridArea: 'main' }}>
								<PageHeading variant="h4">Liquidity Mining Program</PageHeading>
								<StyledBody size="large">
									Earn KWENTA by staking SNX or adding liquidity to the sUSD Curve pool on Optimism.
								</StyledBody>
								<StyledHeading variant="h4">OVM SNX Stakers</StyledHeading>
								<InfoGridContainer style={{ marginBottom: 50 }}>
									<Column>
										<ColumnInner>
											<div>
												<Title>Your Liquidity</Title>
												<div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
													<BigText>2923.39</BigText>
													<StyledSNXIcon currencyKey="SNX" width="23px" height="23px" />
													<DollarValue>$32,284.31</DollarValue>
												</div>
												<Description>Stake SNX on Optimism to earn $KWENTA.</Description>
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
												<div style={{ display: 'flex', marginBottom: 8 }}>
													<BigText>$8,923.22</BigText>
													<OverlappingIcons>
														<CurrencyIcon currencyKey="sETH" width="31px" height="31px" />
														<CurrencyIcon currencyKey="sUSD" width="31px" height="31px" />
													</OverlappingIcons>
												</div>
												<Description>
													Add liquidity to Curve's Stablecoin pool on Optimism to earn $KWENTA.
												</Description>
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
							</div>
							<Rewards />
						</MainGrid>
					</FullHeightContainer>
				</PageContent>
			</AppLayout>
		</>
	);
};

const MainContainer = styled.div`
	flex: 1;
	display: flex;
	justify-content: space-between;
`;

const OverlappingIcons = styled.div`
	display: flex;
`;

const PageHeading = styled(Text.Heading)`
	font-size: 21px;
	margin-bottom: 11px;
`;

const StyledHeading = styled(Text.Heading)`
	font-size: 21px;
	margin-bottom: 16px;
`;

const StyledBody = styled(Text.Body)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	margin-bottom: 40px;
`;

const StyledButton = styled(Button)`
	font-size: 13px;
	height: 38px;
`;

const DollarValue = styled(BigText)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const ColumnInner = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
`;

const StyledSNXIcon = styled(CurrencyIcon)`
	margin: 0 9px;
`;

const MainGrid = styled.div`
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

export default Earn;
