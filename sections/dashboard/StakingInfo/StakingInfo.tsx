import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const StakingInfo: FC = () => {
	const { t } = useTranslation();

	return (
		<StakingContainer>
			<Title>{t('futures-dashboard.titles.staking')}</Title>
			<StakingBody>

			</StakingBody>
		</StakingContainer>
	);
};

const StakingContainer = styled.div``;

const Title = styled.div`
	margin-bottom: 10px;
	font-size: 13px;
	text-transform: uppercase;
	font-weight: 900;
	color: ${(props) => props.theme.colors.purple};
`;

const StakingBody = styled.div`
	width: 100%;
	padding: 18px 25px;
	margin-right: 31px;
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


export default StakingInfo;
