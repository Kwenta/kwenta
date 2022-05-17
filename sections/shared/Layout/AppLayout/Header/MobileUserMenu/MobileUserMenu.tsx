import { FC, useState } from 'react';
import styled from 'styled-components';

import { FixedFooterMixin } from 'styles/common';
import MenuIcon from 'assets/svg/app/menu.svg';
import CloseIcon from 'assets/svg/app/close.svg';

import MobileSettingsModal from './MobileSettingsModal';
import MobileWalletButton from './MobileWalletButton';
import MobileMenuModal from './MobileMenuModal';

const MobileUserMenu: FC = () => {
	const [isOpen, setIsOpen] = useState<'menu' | 'settings' | undefined>();

	const closeModal = () => {
		setIsOpen(undefined);
	};

	const toggleModal = (modal: 'menu' | 'settings') => () => {
		setIsOpen((s) => (!!s ? undefined : modal));
	};

	return (
		<>
			<MobileFooterContainer>
				<MobileFooterIconContainer onClick={toggleModal('menu')}>
					{!!isOpen ? <CloseIcon /> : <MenuIcon />}
				</MobileFooterIconContainer>
				<MobileFooterSeparator />
				<MobileFooterRight>
					<MobileFooterText>{isOpen === 'settings' ? 'Settings' : 'Menu'}</MobileFooterText>
					<MobileWalletButton toggleModal={toggleModal('settings')} />
				</MobileFooterRight>
			</MobileFooterContainer>
			{isOpen === 'menu' && <MobileMenuModal onDismiss={closeModal} />}
			{isOpen === 'settings' && <MobileSettingsModal onDismiss={closeModal} />}
		</>
	);
};

const MobileFooterContainer = styled.div`
	${FixedFooterMixin};
	display: flex;
	align-items: center;
	border-top: 1px solid #2b2a2a;
	padding: 16px 20px;
	background-color: ${(props) => props.theme.colors.selectedTheme.background};
	z-index: 60;
`;

const MobileFooterIconContainer = styled.div`
	width: 25px;
`;

const MobileFooterSeparator = styled.div`
	margin: 0 20px;
	height: 41px;
	width: 1px;
	background-color: #2b2a2a;
`;

const MobileFooterRight = styled.div`
	display: flex;
	flex-grow: 1;
	justify-content: space-between;
	align-items: center;
`;

const MobileFooterText = styled.div`
	font-size: 19px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-family: ${(props) => props.theme.fonts.bold};
`;

export default MobileUserMenu;
