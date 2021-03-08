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

import { MENU_LINKS } from '../constants';
import ConnectionDot from '../ConnectionDot';

type MobileSettingsModalProps = {
	onDismiss: () => void;
};

export const MobileSettingsModal: FC<MobileSettingsModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);

	const { connectWallet, disconnectWallet } = Connector.useContainer();

	return (
		<StyledFullScreenModal isOpen={true}>
			<Container>
				{MENU_LINKS.map(({ i18nLabel, link }) => (
					<MenuButtonContainer key={link}>
						<Link href={link}>
							<MenuButton isActive={asPath.includes(link)} onClick={onDismiss}>
								{t(i18nLabel)}
							</MenuButton>
						</Link>
					</MenuButtonContainer>
				))}
			</Container>
			<Container hasBorder={true}>
				{OPTIONS.map(({ id, label, SelectComponent }) => (
					<OptionRow key={id}>
						<OptionLabel>{t(label)}</OptionLabel>
						<CurrencySelectContainer>
							<SelectComponent />
						</CurrencySelectContainer>
					</OptionRow>
				))}
			</Container>
			<Footer>
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
			</Footer>
		</StyledFullScreenModal>
	);
};

const StyledFullScreenModal = styled(FullScreenModal)`
	border-top: 1px solid ${(props) => props.theme.colors.navy};

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
			border-top: 1px solid ${(props) => props.theme.colors.navy};
		`}
`;

const MenuButtonContainer = styled.div`
	padding-bottom: 16px;
`;

const MenuButton = styled(Button).attrs({ variant: 'alt', size: 'xl' })`
	outline: none;
	width: 100%;
	font-size: 14px;
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
	box-shadow: 0 -8px 8px 0 ${(props) => props.theme.colors.black};
	padding: 24px;
	background-color: ${(props) => props.theme.colors.elderberry};
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

export default MobileSettingsModal;
