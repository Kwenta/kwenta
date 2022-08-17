import { useAccountModal, useChainModal } from '@rainbow-me/rainbowkit';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { Language } from 'translations/constants';
import { useDisconnect } from 'wagmi';

import MobileAccountIcon from 'assets/svg/app/account-info.svg';
import MobileMenuBridgeIcon from 'assets/svg/app/mobile-menu-bridge.svg';
import MobileMenuDisconnectIcon from 'assets/svg/app/mobile-menu-disconnect.svg';
import MobileSwitchIcon from 'assets/svg/app/mobile-switch.svg';
import FullScreenModal from 'components/FullScreenModal';
import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import Logo from 'sections/shared/Layout/Logo';
import { languageState } from 'store/app';

import { lanugageIcons } from './common';
import MobileSubMenu from './MobileSubMenu';

type MobileSettingsModalProps = {
	onDismiss: () => void;
};

type SettingCategories = 'wallet' | 'network' | 'language' | 'currency';

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
											label: t('mobile-menu.account-info'),
											icon: <MobileAccountIcon />,
											onClick: openAccountModal,
										},
										{
											label: t('mobile-menu.disconnect'),
											icon: <MobileMenuDisconnectIcon />,
											onClick: disconnect,
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
