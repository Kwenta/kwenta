import styled from 'styled-components';

import Text from 'components/Text';
import Button from 'components/Button';
import { KwentaText, Title, Description } from '../common';

const Rewards: React.FC = () => {
	return (
		<RewardsContainer>
			<RewardsHeading variant="h5">Kwenta Rewards Total</RewardsHeading>
			<RewardsBody>
				<Title>Your Total Rewards</Title>
				<KwentaText white>734.72</KwentaText>
				<StyledDescription>Total KWENTA claimable one live.</StyledDescription>
				<Button disabled fullWidth>
					Claim KWENTA
				</Button>
			</RewardsBody>
		</RewardsContainer>
	);
};

const RewardsContainer = styled.div`
	grid-area: rsb;
`;

const RewardsBody = styled.div`
	width: 216px;
	padding: 18px 25px;
	border: 1px solid #353333;
	border-radius: 16px;

	& > button {
		height: 38px;
		font-size: 13px;
		&:disabled {
			background-color: transparent;
		}
	}
`;

const StyledDescription = styled(Description)`
	margin-bottom: 18px;
`;

const RewardsHeading = styled(Text.Heading)`
	color: ${(props) => props.theme.colors.common.primaryGold};
	margin-bottom: 8px;
	margin-left: 8px;
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 13px;
`;

export default Rewards;
