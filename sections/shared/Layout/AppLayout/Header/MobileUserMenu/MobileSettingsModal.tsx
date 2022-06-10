import { FC, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Link from 'next/link';
import router, { useRouter } from 'next/router';

import {
	FixedFooterMixin,
	FlexDivCentered,
	FlexDivCol,
	FlexDivRow,
	FlexDivRowCentered,
	TextButton,
} from 'styles/common';
import Connector from 'containers/Connector';
import { isWalletConnectedState, truncatedWalletAddressState } from 'store/wallet';
import { OPTIONS } from 'sections/shared/modals/SettingsModal/constants';
import FullScreenModal from 'components/FullScreenModal';
import Button from 'components/Button';
import { menuLinksState } from '../states';
import ConnectionDot from '../ConnectionDot';
import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';
import { isL2State } from 'store/wallet';

import Logo from 'sections/shared/Layout/Logo';

import MobileSubMenu from './MobileSubMenu';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import { languageState } from 'store/app';
import { Language } from 'translations/constants';

import MobileMenuBridgeIcon from 'assets/svg/app/mobile-menu-bridge.svg';
import MobileMenuDisconnectIcon from 'assets/svg/app/mobile-menu-disconnect.svg';
import MobileSwitchToL1Icon from 'assets/svg/app/mobile-switch-to-l1.svg';
import MobileSwitchWalletIcon from 'assets/svg/app/mobile-switch-wallet.svg';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { lanugageIcons } from './common';

type MobileSettingsModalProps = {
	homepage?: boolean | null;
	onDismiss: () => void;
};

type SettingCategories = 'wallet' | 'network' | 'language' | 'currency';

export const MobileSettingsModal: FC<MobileSettingsModalProps> = ({ homepage, onDismiss }) => {
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

	const handleToggle = (category: SettingCategories) => () => {
		setExpanded((c) => (category === c ? undefined : category));
	};
	
	return (
		<StyledFullScreenModal isOpen={true}>
			<Container>
				<LogoContainer>
					<Logo isFutures isL2={isL2} />
				</LogoContainer>

				{!homepage && 
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
										icon: <MobileSwitchWalletIcon />,
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
				</>}

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
			</Container>
		</StyledFullScreenModal>
	);
};

const StyleFlexDivCol = styled(FlexDivCol)`
	justify-content: space-between;
	align-items: center;
	height: 580px;
`;

const SocialItem = styled.div`
	padding: 10px;
	&:hover {
		color: ${(props) => props.theme.colors.common.primaryWhite};
	}
`;

const StyleFlexDivRow = styled(FlexDivRow)`
	color: ${(props) => props.theme.colors.common.tertiaryGray};
	justify-content: center;
	align-items: center;
	column-gap: 30px;
	margin-top: 51px;
`;

const StyledMenu = styled.div`
	padding: 10px 0px;
	margin-top: 15px;
	display: flex;
	flex-direction: row;
	align-items: center;
`;

const StyledMenuItem = styled.p`
	font-family: ${(props) => props.theme.fonts.bold};
	cursor: pointer;
	width: 90px;
	font-size: 15px;
	height: 30px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	padding-top: 0px;
	padding-bottom: 0px;
	margin: 0px;

	&:hover {
		color: ${(props) => props.theme.colors.common.primaryWhite};
	}

	svg {
		margin-right: 10px;
		width: 15px;
		height: 15px;
	}
`;

const Links = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-content: space-between;
	padding-top: 10px;
`;

const StyledTextButton = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	font-size: 17px;
	line-height: 140%;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.common.tertiaryGray};
	cursor: pointer;
	margin: 0px 20px;
	padding: 24px 0px;
	border-bottom: 1px solid #3d3c3c;

	svg {
		margin-left: 10px;
	}

	> .governance {
		width: 330px;
	}
`;

const StyledFullScreenModal = styled(FullScreenModal)`
	top: 0;

	[data-reach-dialog-content] {
		margin: 0;
		width: 100%;
	}
`;

const Container = styled.div<{ hasBorder?: boolean }>`
	padding: 24px 32px;
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
