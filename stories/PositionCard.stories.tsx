import { PositionSide } from 'sdk/types/futures';
import {
	Container,
	DataCol,
	DataColDivider,
	InfoRow,
	PositionValue,
	StyledValue,
	Subtitle,
} from 'sections/futures/PositionCard/PositionCard';

export const Default = () => {
	return (
		<Container>
			<DataCol>
				<InfoRow>
					<Subtitle>ETH-PERP</Subtitle>
					<StyledValue>-</StyledValue>
				</InfoRow>
				<InfoRow>
					<Subtitle>Side</Subtitle>
					<PositionValue side={PositionSide.LONG}>LONG</PositionValue>
				</InfoRow>
				<InfoRow>
					<Subtitle>Size</Subtitle>
					<StyledValue>-</StyledValue>
				</InfoRow>
			</DataCol>
			<DataColDivider />
			<DataCol>
				<InfoRow>
					<Subtitle>Net Funding</Subtitle>
					<StyledValue>-</StyledValue>
				</InfoRow>
				<InfoRow>
					<Subtitle>Unrealized P&L</Subtitle>
					<StyledValue>-</StyledValue>
				</InfoRow>
				<InfoRow>
					<Subtitle>Realized P&L</Subtitle>
					<StyledValue>-</StyledValue>
				</InfoRow>
			</DataCol>
			<DataColDivider />
			<DataCol>
				<InfoRow>
					<Subtitle>Leverage</Subtitle>
					<StyledValue>10x</StyledValue>
				</InfoRow>
				<InfoRow>
					<Subtitle>Liquidation Price</Subtitle>
					<StyledValue>-</StyledValue>
				</InfoRow>
				<InfoRow>
					<Subtitle>Avg. Entry Price</Subtitle>
					<StyledValue>-</StyledValue>
				</InfoRow>
			</DataCol>
		</Container>
	);
};
