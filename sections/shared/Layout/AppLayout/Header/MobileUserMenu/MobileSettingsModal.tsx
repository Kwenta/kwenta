import { FC, useReducer } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Connector from 'containers/Connector';

import { isL2State, isWalletConnectedState, truncatedWalletAddressState } from 'store/wallet';
import { OPTIONS } from 'sections/shared/modals/SettingsModal/constants';

import FullScreenModal from 'components/FullScreenModal';
import Logo from 'sections/shared/Layout/Logo';

import { menuLinksState } from '../states';
import ConnectionDot from '../ConnectionDot';
import { ROUTES } from 'constants/routes';

type MobileSettingsModalProps = {
	onDismiss: () => void;
};

const SUB_MENUS = {
	[ROUTES.Home.Overview]: [
		{ label: 'Overview' },
		{ label: 'Positions' },
		{ label: 'Rewards' },
		{ label: 'Markets' },
		{ label: 'Governance' },
	],
};

type SubMenuProps = {
	i18nLabel: string;
	link: string;
	defaultOpen?: boolean;
};

const SubMenu: React.FC<SubMenuProps> = ({ i18nLabel, link, defaultOpen }) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const [isExpanded, toggleExpanded] = useReducer((s) => !s, defaultOpen ?? false);

	return (
		<>
			<MenuButton isActive={asPath.includes(link)} onClick={toggleExpanded}>
				{t(i18nLabel)}
			</MenuButton>
			{isExpanded && (
				<SubMenuContainer>
					{SUB_MENUS[link].map(({ label }) => (
						<Link href="" key={label}>
							<SubMenuItem>{label}</SubMenuItem>
						</Link>
					))}
				</SubMenuContainer>
			)}
		</>
	);
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
							<SubMenu i18nLabel={i18nLabel} link={link} />
						) : (
							<Link href={link}>
								<MenuButton isActive={asPath.includes(link)} onClick={onDismiss}>
									{t(i18nLabel)}
								</MenuButton>
							</Link>
						)}
					</MenuButtonContainer>
				))}
			</Container>
			{/*<Container hasBorder={true}>
				{OPTIONS.map(({ id, label, SelectComponent }) => (
					<OptionRow key={id}>
						<OptionLabel>{t(label)}</OptionLabel>
						<CurrencySelectContainer>
							<SelectComponent />
						</CurrencySelectContainer>
					</OptionRow>
				))}
			</Container>*/}
			{/*<Footer>
				{isWalletConnected ? (
					<>
						<WalletConnected>
							<FlexDivCentered>
								<StyledConnectionDot />
								{truncatedWalletAddress}
							</FlexDivCentered>
							<SwitchWalletButton
								onClick={() => {
									onDismiss();
									connectWallet();
								}}
							>
								{t('common.switch')}
							</SwitchWalletButton>
						</WalletConnected>
						<Button
							variant="danger"
							onClick={() => {
								onDismiss();
								disconnectWallet();
							}}
						>
							{t('common.wallet.disconnect-wallet')}
						</Button>
					</>
				) : (
					<Button
						variant="primary"
						onClick={() => {
							onDismiss();
							connectWallet();
						}}
					>
						{t('common.wallet.connect-wallet')}
					</Button>
				)}
					</Footer>*/}
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

const MenuButton = styled.div<{ isActive: boolean }>`
	outline: none;
	width: 100%;
	font-size: 25px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.common.secondaryGray};
	text-transform: capitalize;
	margin-bottom: 30px;

	${(props) =>
		props.isActive &&
		css`
			color: ${(props) => props.theme.colors.common.primaryWhite};
		`}
`;

const SubMenuContainer = styled.div`
	box-sizing: border-box;
	padding-left: 30px;
	border-left: 3px solid #2b2a2a;
`;

const SubMenuItem = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 25px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	margin-bottom: 30px;
`;

const LogoContainer = styled.div`
	margin-bottom: 50px;
`;

export default MobileSettingsModal;
