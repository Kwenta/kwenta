import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const StakingInfo: FC = () => {
	const { t } = useTranslation();

	return (
		<>
			<Title>{t('futures-dashboard.titles.staking')}</Title>
		</>
	);
};

const Title = styled.div`
	margin-bottom: 10px;
	font-size: 13px;
	text-transform: uppercase;
	font-weight: 900;
	color: ${(props) => props.theme.colors.purple};
`;

export default StakingInfo;
