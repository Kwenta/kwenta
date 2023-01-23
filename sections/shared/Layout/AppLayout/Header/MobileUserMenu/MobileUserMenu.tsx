import Link from 'next/link';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CloseIcon from 'assets/svg/app/close.svg';
import MenuIcon from 'assets/svg/app/menu.svg';
import Button from 'components/Button';
import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import ROUTES from 'constants/routes';
import { useAppSelector } from 'state/hooks';
import { selectCurrentTheme } from 'state/preferences/selectors';
import { FixedFooterMixin } from 'styles/common';

import MobileMenuModal from './MobileMenuModal';
import MobileSettingsModal from './MobileSettingsModal';
import MobileWalletButton from './MobileWalletButton';

const MobileUserMenu: FC = () => {
	const [isOpen, setIsOpen] = useState<'menu' | 'settings' | undefined>();
	const { t } = useTranslation();

	const currentTheme = useAppSelector(selectCurrentTheme);

	const closeModal = () => {
		setIsOpen(undefined);
	};

	const toggleModal = (modal: 'menu' | 'settings') => () => {
		setIsOpen((s) => {
			if (!!s) {
				if (s === modal) {
					return undefined;
				} else if (s === 'menu') {
					return 'settings';
				} else {
					return 'menu';
				}
			} else {
				return modal;
			}
		});
	};

	return (
		<>
			<MobileFooterContainer>
				<MobileFooterIconContainer onClick={!!isOpen ? closeModal : toggleModal('menu')}>
					{!!isOpen ? <CloseIcon /> : <MenuIcon />}
				</MobileFooterIconContainer>
				<MobileFooterSeparator />
				{!(window.location.pathname === ROUTES.Home.Root) && isOpen === 'menu' && (
					<SettingsWrapper currentTheme={currentTheme}>{t('modals.menu.title')}</SettingsWrapper>
				)}
				{!(window.location.pathname === ROUTES.Home.Root) && isOpen === 'settings' && (
					<SettingsWrapper currentTheme={currentTheme}>
						{t('modals.settings.title')}
					</SettingsWrapper>
				)}
				<MobileFooterRight>
					{window.location.pathname === ROUTES.Home.Root ? (
						<Link href={ROUTES.Markets.Home(DEFAULT_FUTURES_MARGIN_TYPE)}>
							<Button size="sm">{t('homepage.nav.start-trade')}</Button>
						</Link>
					) : (
						<MobileWalletButton closeModal={closeModal} toggleModal={toggleModal('settings')} />
					)}
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
	z-index: 51;
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
	justify-content: flex-end;
	align-items: center;
`;

const SettingsWrapper = styled.div<{ currentTheme: 'dark' | 'light' }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 19px;
	line-height: 19px;
	color: ${(props) =>
		props.currentTheme === 'dark'
			? props.theme.colors.selectedTheme.white
			: props.theme.colors.selectedTheme.black};
	text-transform: capitalize;
`;

export default MobileUserMenu;
