import Link from 'next/link';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CloseIcon from 'assets/svg/app/close.svg';
import MenuIcon from 'assets/svg/app/menu.svg';
import Button from 'components/Button';
import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import ROUTES from 'constants/routes';
import { PositionSide } from 'sdk/types/futures';
import { setLeverageSide, setTradePanelDrawerOpen } from 'state/futures/reducer';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { selectCurrentTheme } from 'state/preferences/selectors';
import { FixedFooterMixin } from 'styles/common';

import MobileMenuModal from './MobileMenuModal';
import MobileSettingsModal from './MobileSettingsModal';
import MobileWalletButton from './MobileWalletButton';

const MobileUserMenu: FC = () => {
	const [isOpen, setIsOpen] = useState<'menu' | 'settings' | undefined>();
	const { t } = useTranslation();

	const currentTheme = useAppSelector(selectCurrentTheme);
	const dispatch = useAppDispatch();

	const closeModal = () => {
		setIsOpen(undefined);
	};

	const toggleModal = (modal: 'menu' | 'settings') => () => {
		setIsOpen((s) => {
			if (!!s) {
				return s === modal ? undefined : s === 'menu' ? 'settings' : 'menu';
			} else {
				return modal;
			}
		});
	};

	const handleSideSelect = useCallback(
		(side: PositionSide) => () => {
			dispatch(setLeverageSide(side));
			dispatch(setTradePanelDrawerOpen(true));
		},
		[dispatch]
	);

	return (
		<>
			<MobileFooterContainer>
				<MobileFooterIconContainer onClick={!!isOpen ? closeModal : toggleModal('menu')}>
					{!!isOpen ? <CloseIcon /> : <MenuIcon />}
				</MobileFooterIconContainer>
				<MobileFooterSeparator />
				{window.location.pathname !== ROUTES.Home.Root &&
					!window.location.pathname.includes('/market') &&
					!!isOpen && (
						<SettingsWrapper currentTheme={currentTheme}>
							{t(`modals.${isOpen}.title`)}
						</SettingsWrapper>
					)}
				<MobileFooterRight>
					{window.location.pathname === ROUTES.Home.Root ? (
						<Link href={ROUTES.Markets.Home(DEFAULT_FUTURES_MARGIN_TYPE)}>
							<Button size="small">{t('homepage.nav.start-trade')}</Button>
						</Link>
					) : window.location.pathname.includes('/market') ? (
						<PositionButtonsContainer>
							<Button
								size="xsmall"
								variant="long"
								fontSize={13}
								fullWidth
								onClick={handleSideSelect(PositionSide.LONG)}
							>
								Long
							</Button>
							<Button
								size="xsmall"
								variant="short"
								fontSize={13}
								fullWidth
								onClick={handleSideSelect(PositionSide.SHORT)}
							>
								Short
							</Button>
						</PositionButtonsContainer>
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

const PositionButtonsContainer = styled.div`
	display: grid;
	width: 100%;
	grid-template-columns: 1fr 1fr;
	grid-gap: 8px;
`;

export default MobileUserMenu;
