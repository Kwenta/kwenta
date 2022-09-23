import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { BorderedPanel } from 'styles/common';

type FuturesUnsupportedProps = {
	isWalletConnected: boolean;
};

const FuturesUnsupported: React.FC<FuturesUnsupportedProps> = ({ isWalletConnected }) => {
	const { t } = useTranslation();
	const { switchToL2 } = useNetworkSwitcher();
	const { openConnectModal: connectWallet } = useConnectModal();
	return (
		<MessageContainer>
			<Title>{t('futures.page-title')}</Title>
			{isWalletConnected ? (
				<>
					<UnsupportedMessage>{t('common.l2-cta')}</UnsupportedMessage>
					<LinkContainer>
						<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
					</LinkContainer>
				</>
			) : (
				<>
					<UnsupportedMessage>{t('common.perp-cta')}</UnsupportedMessage>
					<LinkContainer>
						<div onClick={connectWallet}>{t('common.wallet.connect-wallet')}</div>
					</LinkContainer>
				</>
			)}
		</MessageContainer>
	);
};

const UnsupportedMessage = styled.div`
	margin-top: 12px;
`;

const LinkContainer = styled.div`
	margin-top: 12px;
	div {
		cursor: pointer;
		font-size: 12px;
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.monoBold};
	font-size: 23px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const MessageContainer = styled(BorderedPanel)`
	text-align: center;
	padding: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

export default FuturesUnsupported;
