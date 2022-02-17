import styled from 'styled-components';

import Text from 'components/Text';
import Button from 'components/Button';
import { KwentaText, Title, Description } from '../common';

const Rewards: React.FC = () => {
	return (
		<div style={{ gridArea: 'rsb' }}>
			<RewardsHeading variant="h5">Kwenta Rewards Total</RewardsHeading>
			<RewardsContainer>
				<Title>Your Total Rewards</Title>
				<KwentaText white>734.72</KwentaText>
				<StyledDescription>Total KWENTA claimable one live.</StyledDescription>
				<Button disabled>Claim KWENTA</Button>
			</RewardsContainer>
		</div>
	);
};

const RewardsContainer = styled.div`
	width: 216px;
	padding: 18px 25px;
	border: 1px solid #353333;
	border-radius: 16px;
`;

const StyledDescription = styled(Description)`
	margin-bottom: 13px;
`;

const RewardsHeading = styled(Text.Heading)`
	color: ${(props) => props.theme.colors.common.primaryGold};
	margin-bottom: 16px;
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.bold};
`;

export default Rewards;
