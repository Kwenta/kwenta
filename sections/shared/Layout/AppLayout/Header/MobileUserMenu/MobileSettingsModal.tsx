import { FC, useState } from 'react';
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

import MobileSubMenu from './MobileSubMenu';

type MobileSettingsModalProps = {
	onDismiss(): void;
};

export const MobileSettingsModal: FC<MobileSettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	// const isWalletConnected = useRecoilValue(isWalletConnectedState);
	// const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const isL2 = useRecoilValue(isL2State);

	// const { connectWallet, disconnectWallet } = Connector.useContainer();
	type SettingCategories = 'wallet' | 'network' | 'language' | 'currency';
	const [expanded, setExpanded] = useState<SettingCategories>();

	const handleToggle = (category: SettingCategories) => () => {
		setExpanded((c) => (category === c ? undefined : category));
	};

	return (
		<StyledFullScreenModal isOpen={true}>
			<Container>
				<LogoContainer>
					<Logo isFutures isL2={isL2} />
				</LogoContainer>

				<MenuButtonContainer>
					<MobileSubMenu
						i18nLabel="Wallet"
						onDismiss={onDismiss}
						active={expanded === 'wallet'}
						onToggle={handleToggle('wallet')}
					/>
				</MenuButtonContainer>

				<MenuButtonContainer>
					<MobileSubMenu
						i18nLabel="Network"
						onDismiss={onDismiss}
						active={expanded === 'network'}
						onToggle={handleToggle('network')}
					/>
				</MenuButtonContainer>

				<MenuButtonContainer>
					<MobileSubMenu
						i18nLabel="Language"
						onDismiss={onDismiss}
						active={expanded === 'language'}
						onToggle={handleToggle('language')}
					/>
				</MenuButtonContainer>

				<MenuButtonContainer>
					<MobileSubMenu
						i18nLabel="Currency"
						onDismiss={onDismiss}
						active={expanded === 'currency'}
						onToggle={handleToggle('language')}
					/>
				</MenuButtonContainer>
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
