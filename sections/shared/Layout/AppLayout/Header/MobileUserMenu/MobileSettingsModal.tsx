import { useAccountModal, useChainModal } from '@rainbow-me/rainbowkit';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import styled, { css } from 'styled-components';
import { Language } from 'translations/constants';
import { useDisconnect } from 'wagmi';

import MobileAccountIcon from 'assets/svg/app/account-info.svg';
import MobileMenuBridgeIcon from 'assets/svg/app/mobile-menu-bridge.svg';
import MobileMenuDisconnectIcon from 'assets/svg/app/mobile-menu-disconnect.svg';
import MobileSwitchIcon from 'assets/svg/app/mobile-switch.svg';
import MoonIcon from 'assets/svg/app/moon.svg';
import SunIcon from 'assets/svg/app/sun.svg';
import FullScreenModal from 'components/FullScreenModal';
import { EXTERNAL_LINKS } from 'constants/links';
import { languageIcon } from 'constants/menu';
import ROUTES from 'constants/routes';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import Logo from 'sections/shared/Layout/Logo';
import { languageState } from 'store/app';
import { currentThemeState } from 'store/ui';
import colors from 'styles/theme/colors';

import MobileSubMenu from './MobileSubMenu';

type MobileSettingsModalProps = {
	onDismiss: () => void;
};

type SettingCategories = 'wallet' | 'network' | 'language' | 'currency' | 'theme';

export const MobileSettingsModal: FC<MobileSettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
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

	const { openAccountModal } = useAccountModal();
	const { openChainModal } = useChainModal();
	const { disconnect } = useDisconnect();

	const [expanded, setExpanded] = useState<SettingCategories>();
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
							<div>
								<MobileSubMenu
									i18nLabel={t('mobile-menu.wallet')}
									onDismiss={onDismiss}
									active={expanded === 'wallet'}
									onToggle={handleToggle('wallet')}
									options={[
										{
											label: t('mobile-menu.account-info'),
											icon: (
												<MobileAccountIcon
													fill={currentTheme === 'light' ? colors.common.secondaryGray : 'none'}
												/>
											),
											onClick: openAccountModal,
										},
										{
											label: t('mobile-menu.disconnect'),
											icon: <MobileMenuDisconnectIcon />,
											onClick: disconnect,
										},
									]}
								/>
							</div>

							<div>
								<MobileSubMenu
									i18nLabel={t('mobile-menu.network')}
									onDismiss={onDismiss}
									active={expanded === 'network'}
									onToggle={handleToggle('network')}
									options={[
										{
											label: t('mobile-menu.switch-network'),
											icon: <MobileSwitchIcon />,
											onClick: openChainModal,
										},
										{
											label: `${t('mobile-menu.bridge')} ↗`,
											icon: <MobileMenuBridgeIcon />,
											externalLink: EXTERNAL_LINKS.Trading.OptimismTokenBridge,
										},
									]}
								/>
							</div>
						</>
					)}

					<div>
						<MobileSubMenu
							i18nLabel={t('mobile-menu.language')}
							onDismiss={onDismiss}
							active={expanded === 'language'}
							onToggle={handleToggle('language')}
							options={languageOptions.map((option) => ({
								label: option.label,
								icon: <div>{languageIcon[option.value as Language]}</div>,
								selected: languages[language] === option.value,
								onClick: () => setLanguage(option.value as Language),
							}))}
						/>
					</div>

					{!(window.location.pathname === ROUTES.Home.Root) && (
						<div>
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
						</div>
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

const LogoContainer = styled.div`
	margin-bottom: 50px;
`;

export default MobileSettingsModal;
