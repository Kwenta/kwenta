import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import BigText from 'components/Text/BigText';

import { Title } from '../common';

const StakingInfo: FC = () => {
	const { t } = useTranslation();

	return (
		<StakingContainer>
			<CardTitle>{t('dashboard.titles.staking')}</CardTitle>
			<StakingBody>
				<Title>APY:</Title>
				<BigText white>--%</BigText>

				<Title>Claimable:</Title>
				<BigText white logo>
					--
				</BigText>
				<StyledButton fullWidth disabled>
					Claim Rewards
				</StyledButton>
			</StakingBody>
		</StakingContainer>
	);
};

const StakingContainer = styled.div`
	max-width: 255px;
`;

const StyledButton = styled(Button)`
	margin-top: 20px;
`;

const CardTitle = styled.div`
	margin-bottom: 10px;
	font-size: 13px;
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.black};
	color: ${(props) => props.theme.colors.common.primaryGold};
`;

const StakingBody = styled.div`
	width: 100%;
	padding: 18px 25px;
	margin-right: 31px;
	border: 1px solid #353333;
	border-radius: 10px;

	& > button {
		height: 38px;
		font-size: 13px;
		&:disabled {
			background-color: transparent;
		}
	}
`;

export default StakingInfo;
