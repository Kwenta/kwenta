import { FC, useState, useReducer } from 'react';
import styled from 'styled-components';

import { FixedFooterMixin } from 'styles/common';

import MobileSettingsModal from './MobileSettingsModal';
import MobileWalletButton from './MobileWalletButton';

import MenuIcon from 'assets/svg/app/menu.svg';
import CloseIcon from 'assets/svg/app/close.svg';

const MobileUserMenu: FC = () => {
	const [isModalOpen, toggleModalOpen] = useReducer((s) => !s, false);
	const [settingsModalOpened, setSettingsModalOpened] = useState(false);

	return (
		<>
			<MobileFooterContainer>
				<MobileFooterIconContainer onClick={toggleModalOpen}>
					{isModalOpen ? <CloseIcon /> : <MenuIcon />}
				</MobileFooterIconContainer>
				<MobileFooterSeparator />
				<MobileFooterRight>
					<div className="text">Menu</div>
					<MobileWalletButton />
				</MobileFooterRight>
			</MobileFooterContainer>
			{isModalOpen && <MobileSettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
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

	.text {
		font-size: 19px;
		color: ${(props) => props.theme.colors.common.primaryWhite};
		font-family: ${(props) => props.theme.fonts.bold};
	}
`;

export default MobileUserMenu;
