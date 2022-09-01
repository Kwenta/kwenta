import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';
import { Language } from 'translations/constants';

import MobileMenuBridgeIcon from 'assets/svg/app/mobile-menu-bridge.svg';
import MobileMenuDisconnectIcon from 'assets/svg/app/mobile-menu-disconnect.svg';
import MobileSwitchToL1Icon from 'assets/svg/app/mobile-switch-to-l1.svg';
import MobileSwitchWalletIcon from 'assets/svg/app/mobile-switch-wallet.svg';
import MoonIcon from 'assets/svg/app/moon.svg';
import SunIcon from 'assets/svg/app/sun.svg';
import FullScreenModal from 'components/FullScreenModal';
import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import Logo from 'sections/shared/Layout/Logo';
import { languageState } from 'store/app';
import { currentThemeState } from 'store/ui';
import { isL2State } from 'store/wallet';
import colors from 'styles/theme/colors';

import { lanugageIcons } from './common';
import MobileSubMenu from './MobileSubMenu';

type MobileSettingsModalProps = {
	onDismiss: () => void;
};

type SettingCategories = 'wallet' | 'network' | 'language' | 'currency' | 'theme';

export const MobileSettingsModal: FC<MobileSettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);
	const [language, setLanguage] = usePersistedRecoilState(languageState);

	const languages = t('languages', { returnObjects: true }) as Record<Language, string>;

	const languageOptions = useMemo(
		() =>
			Object.entries(languages).map(([langCode, langLabel]) => ({
				value: langCode,
				label: langLabel,
			})),
		[languages]
	);

	const { connectWallet, disconnectWallet } = Connector.useContainer();
	const [expanded, setExpanded] = useState<SettingCategories>();
	const { switchToL1, switchToL2 } = useNetworkSwitcher();
	const [currentTheme, setTheme] = useRecoilState(currentThemeState);

	const toggleTheme = () => {
		setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
	};

	const handleToggle = (category: SettingCategories) => () => {
		setExpanded((c) => (category === c ? undefined : category));
	};

	return (
		<StyledFullScreenModal isOpen>
			<Container>
				<LogoContainer>
					<Logo />
				</LogoContainer>

				<div>
					{!(window.location.pathname === ROUTES.Home.Root) && (
						<>
							<MenuButtonContainer>
								<MobileSubMenu
									i18nLabel={t('mobile-menu.wallet')}
									onDismiss={onDismiss}
									active={expanded === 'wallet'}
									onToggle={handleToggle('wallet')}
									options={[
										{
											label: t('mobile-menu.switch'),
											icon: (
												<MobileSwitchWalletIcon
													fill={currentTheme === 'light' ? colors.common.secondaryGray : 'none'}
												/>
											),
											onClick: connectWallet,
										},
										{
											label: t('mobile-menu.disconnect'),
											icon: <MobileMenuDisconnectIcon />,
											onClick: disconnectWallet,
										},
									]}
								/>
							</MenuButtonContainer>

							<MenuButtonContainer>
								<MobileSubMenu
									i18nLabel={t('mobile-menu.network')}
									onDismiss={onDismiss}
									active={expanded === 'network'}
									onToggle={handleToggle('network')}
									options={[
										{
											label: isL2 ? t('mobile-menu.switch-to-l1') : t('mobile-menu.switch-to-l2'),
											icon: <MobileSwitchToL1Icon />,
											onClick: isL2 ? switchToL1 : switchToL2,
										},
										{
											label: `${t('mobile-menu.bridge')} ↗`,
											icon: <MobileMenuBridgeIcon />,
											externalLink: EXTERNAL_LINKS.Trading.OptimismTokenBridge,
										},
									]}
								/>
							</MenuButtonContainer>
						</>
					)}

					<MenuButtonContainer>
						<MobileSubMenu
							i18nLabel={t('mobile-menu.language')}
							onDismiss={onDismiss}
							active={expanded === 'language'}
							onToggle={handleToggle('language')}
							options={languageOptions.map((option) => ({
								label: option.label,
								icon: <div>{lanugageIcons[option.value as Language]}</div>,
								selected: languages[language] === option.value,
								onClick: () => setLanguage(option.value as Language),
							}))}
						/>
					</MenuButtonContainer>

					{!(window.location.pathname === ROUTES.Home.Root) && (
						<MenuButtonContainer>
							<MobileSubMenu
								i18nLabel={t('mobile-menu.theme.title')}
								onDismiss={onDismiss}
								active={expanded === 'theme'}
								onToggle={handleToggle('theme')}
								options={[
									{
										label: t('mobile-menu.theme.options.dark'),
										icon: (
											<MoonIcon
												fill={
													currentTheme === 'dark'
														? colors.common.secondaryGold
														: colors.common.secondaryGray
												}
											/>
										),
										onClick: toggleTheme,
										selected: currentTheme === 'dark',
									},
									{
										label: t('mobile-menu.theme.options.light'),
										icon: (
											<SunIcon
												fill={
													currentTheme === 'light'
														? colors.common.secondaryGold
														: colors.common.secondaryGray
												}
											/>
										),
										onClick: toggleTheme,
										selected: currentTheme === 'light',
									},
								]}
							/>
						</MenuButtonContainer>
					)}
				</div>
			</Container>
		</StyledFullScreenModal>
	);
};

const StyledFullScreenModal = styled(FullScreenModal)`
	top: 0;

	[data-reach-dialog-content] {
		margin: 0;
		width: 100%;
		height: 100%;

		& > div {
			height: 100%;
		}
	}
`;

const Container = styled.div<{ hasBorder?: boolean }>`
	padding: 24px 32px 100px;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	${(props) =>
		props.hasBorder &&
		css`
			border-top: 1px solid ${(props) => props.theme.colors.common.secondaryGray};
		`}
`;

const MenuButtonContainer = styled.div`
	/* padding-bottom: 16px; */
`;

const LogoContainer = styled.div`
	margin-bottom: 50px;
`;

export default MobileSettingsModal;
