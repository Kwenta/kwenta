import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import AlertIcon from 'assets/svg/app/alert.svg';
import Spacer from 'components/Spacer/Spacer';
import { Body } from 'components/Text';

const CloseOnlyPrompt = () => {
	const { t } = useTranslation();
	const theme = useTheme();

	return (
		<MessageContainer>
			<Title>
				<AlertIcon fill={theme.colors.selectedTheme.newTheme.pencilIcon.color} />
			</Title>
			<Spacer height={21.25} />
			<Body size="large">{t('futures.cta-buttons.close-only')}</Body>
		</MessageContainer>
	);
};

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.monoBold};
	font-size: 23px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const MessageContainer = styled.div`
	padding: 0 30px;
	text-align: center;
	display: flex;
	flex-direction: column;
	justify-content: center;
`;

export default CloseOnlyPrompt;
