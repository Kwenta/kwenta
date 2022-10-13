import styled from 'styled-components';

import Button from 'components/Button';
import Text from 'components/Text';
import BigText from 'components/Text/BigText';

import { Title, Description } from '../common';

const Rewards: React.FC = () => {
	return (
		<RewardsContainer>
			<RewardsHeading variant="h5">Kwenta Rewards Total</RewardsHeading>
			<RewardsBody>
				<Title>Your Total Rewards</Title>
				<BigText white logo>
					734.72
				</BigText>
				<StyledDescription>Total KWENTA claimable one live.</StyledDescription>
				<Button disabled fullWidth>
					Claim KWENTA
				</Button>
			</RewardsBody>
		</RewardsContainer>
	);
};

const RewardsContainer = styled.div`
	width: 216px;
	margin-left: 16px;
`;

const RewardsBody = styled.div`
	width: 100%;
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
