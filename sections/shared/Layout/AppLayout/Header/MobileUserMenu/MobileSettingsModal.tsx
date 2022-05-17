import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';

// import Connector from 'containers/Connector';

import {
	isL2State,
	// isWalletConnectedState,
	// truncatedWalletAddressState
} from 'store/wallet';

import FullScreenModal from 'components/FullScreenModal';
import Logo from 'sections/shared/Layout/Logo';
import Links from 'sections/dashboard/Links';

import { menuLinksState } from '../states';
// import ConnectionDot from '../ConnectionDot';

import MobileSubMenu from './MobileSubMenu';
import { MenuButton, SUB_MENUS } from './common';
import MobileMenuArrow from 'assets/svg/app/mobile-menu-arrow.svg';

type MobileSettingsModalProps = {
	onDismiss(): void;
};

export const MobileSettingsModal: FC<MobileSettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	// const isWalletConnected = useRecoilValue(isWalletConnectedState);
	// const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const menuLinks = useRecoilValue(menuLinksState);
	const isL2 = useRecoilValue(isL2State);

	// const { connectWallet, disconnectWallet } = Connector.useContainer();

	return (
		<StyledFullScreenModal isOpen={true}>
			<Container>
				<LogoContainer>
					<Logo isFutures isL2={isL2} />
				</LogoContainer>
				{menuLinks.map(({ i18nLabel, link }) => (
					<MenuButtonContainer key={link}>
						{SUB_MENUS[link] ? (
							<MobileSubMenu
								i18nLabel={i18nLabel}
								link={link}
								defaultOpen={asPath.includes(link)}
								onDismiss={onDismiss}
							/>
						) : (
							<Link href={link}>
								<MenuButton isActive={asPath.includes(link)} onClick={onDismiss}>
									{t(i18nLabel)}
									<MobileMenuArrow />
								</MenuButton>
							</Link>
						)}
					</MenuButtonContainer>
				))}
				<Links isMobile />
			</Container>
		</StyledFullScreenModal>
	);
};

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
