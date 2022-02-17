import CurrencyIcon from 'components/Currency/CurrencyIcon';
import {
	BigText,
	KwentaText,
	Title,
	Description,
	StyledButton,
	ColumnInner,
	GridHeading,
	InfoGridContainer,
	Column,
	SplitColumn,
	OverlappingIcons,
} from '../common';

const StakeGrid = () => {
	return (
		<>
			<GridHeading variant="h4">OVM sUSD Curve LP</GridHeading>
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
		</>
	);
};

export default StakeGrid;
