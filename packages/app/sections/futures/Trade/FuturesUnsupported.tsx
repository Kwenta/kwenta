import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import { FlexDivCentered } from 'components/layout/flex';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';

const FuturesUnsupportedNetwork = () => {
	const { t } = useTranslation();
	const { switchToL2 } = useNetworkSwitcher();
	return (
		<MessageContainer>
			<Title>{t('futures.page-title')}</Title>
			<UnsupportedMessage>{t('common.l2-cta')}</UnsupportedMessage>
			<ButtonContainer>
				<Button variant="yellow" onClick={switchToL2}>
					{t('homepage.l2.cta-buttons.switch-l2')}
				</Button>
			</ButtonContainer>
		</MessageContainer>
	);
};

const UnsupportedMessage = styled.div`
	margin-top: 12px;
`;

const ButtonContainer = styled(FlexDivCentered)`
	width: 100%;
	justify-content: center;
	margin-top: 15px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.monoBold};
	font-size: 23px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const MessageContainer = styled.div`
	padding: 20px;
	text-align: center;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

export default FuturesUnsupportedNetwork;
