import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { FixedFooterMixin, FlexDivCentered, FlexDivRowCentered, TextButton } from 'styles/common';

import Connector from 'containers/Connector';

import { isWalletConnectedState, truncatedWalletAddressState } from 'store/wallet';
import { OPTIONS } from 'sections/shared/modals/SettingsModal/constants';

import FullScreenModal from 'components/FullScreenModal';
import Button from 'components/Button';

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

export const MobileSettingsModal: FC<MobileSettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const menuLinks = useRecoilValue(menuLinksState);

	const { connectWallet, disconnectWallet } = Connector.useContainer();

	return (
		<StyledFullScreenModal isOpen={true}>
			<Container>
				{menuLinks.map(({ i18nLabel, link }) => (
					<MenuButtonContainer key={link}>
						{SUB_MENUS[link] ? (
							<>
								<MenuButton isActive={asPath.includes(link)} onClick={onDismiss}>
									{t(i18nLabel)}
								</MenuButton>
								<SubMenuContainer>
									{SUB_MENUS[link].map(({ label }) => (
										<Link href="" key={label}>
											<SubMenuItem>{label}</SubMenuItem>
										</Link>
									))}
								</SubMenuContainer>
							</>
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
	font-size: 19px;
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

const CurrencySelectContainer = styled.div`
	width: 100%;
`;

const OptionLabel = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
	padding-bottom: 8px;
`;

const OptionRow = styled.div`
	padding-bottom: 16px;
`;

const WalletConnected = styled(FlexDivRowCentered)`
	font-family: ${(props) => props.theme.fonts.mono};
	background-color: ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.white};
	border-radius: 4px;
	margin-bottom: 24px;
	padding: 0 16px;
`;

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 12px;
	width: 12px;
	height: 12px;
`;

const Footer = styled.div`
	${FixedFooterMixin};
	border-top: 1px solid ${(props) => props.theme.colors.common.secondaryGray};
	padding: 24px;
	> * {
		font-size: 14px;
		width: 100%;
		height: 40px;
	}
`;

const SwitchWalletButton = styled(TextButton)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.goldColors.color1};
	text-transform: uppercase;
`;

const SubMenuContainer = styled.div`
	box-sizing: border-box;
	padding-left: 30px;
	border-left: 3px solid #2b2a2a;
`;

const SubMenuItem = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 19px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	margin-bottom: 30px;
`;

export default MobileSettingsModal;
