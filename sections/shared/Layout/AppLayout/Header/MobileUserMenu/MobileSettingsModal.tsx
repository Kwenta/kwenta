import { FC, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Link from 'next/link';
import router, { useRouter } from 'next/router';

import ArrowUpRightIcon from 'assets/svg/app/arrow-up-right-tg.svg';
import CaretDownGrayIcon from 'assets/svg/app/caret-down-gray-slim.svg';
import DiscordLogo from 'assets/svg/social/discord.svg';
import MirrorLogo from 'assets/svg/social/mirror.svg';
import TwitterLogo from 'assets/svg/marketing/twitter-icon.svg';
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

type MobileSettingsModalProps = {
	homepage?: boolean | null;
	onDismiss: () => void;
};

export const MobileSettingsModal: FC<MobileSettingsModalProps> = ({ homepage, onDismiss }) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const menuLinks = useRecoilValue(menuLinksState);

	const { connectWallet, disconnectWallet } = Connector.useContainer();
	const [isGovernanceShown, setIsGovernanceShown] = useState(false);

	const LINKS = [
		{
			id: 'market',
			label: t('homepage.nav.markets'),
			onClick: () => router.push(ROUTES.Home.Markets),
		},
		{
			id: 'governance',
			label: t('homepage.nav.governance.title'),
			icon: <CaretDownGrayIcon />,
			onClick: () => {
				return isGovernanceShown ? setIsGovernanceShown(false) : setIsGovernanceShown(true);
			},
		},
		{
			id: 'blogs',
			label: t('homepage.nav.blog'),
			icon: <ArrowUpRightIcon />,
			onClick: () => window.open(EXTERNAL_LINKS.Social.Mirror, '_blank'),
		},
	];

	const GOVERNANCE = [
		{
			id: 'overview',
			label: t('homepage.nav.governance.overview'),
			onClick: () => window.open(EXTERNAL_LINKS.Docs.Governance, '_blank'),
		},
		{
			id: 'kips',
			label: t('homepage.nav.governance.kips'),
			onClick: () => window.open(EXTERNAL_LINKS.Kips.Home, '_blank'),
		},
	];

	const SOCIALS = [
		{
			id: 'discord',
			label: t('homepage.nav.socials.discord'),
			onClick: () => window.open(EXTERNAL_LINKS.Social.Discord, '_blank'),
			icon: <DiscordLogo />,
		},
		{
			id: 'twitter',
			label: t('homepage.nav.socials.twitter'),
			onClick: () => window.open(EXTERNAL_LINKS.Social.Twitter, '_blank'),
			icon: <TwitterLogo />,
		},
		{
			id: 'mirror',
			label: t('homepage.nav.socials.mirror'),
			onClick: () => window.open(EXTERNAL_LINKS.Social.Mirror, '_blank'),
			icon: <MirrorLogo />,
		},
	];

	return (
		<StyledFullScreenModal isOpen={true}>
			{homepage ? (
				<StyleFlexDivCol>
					<Links>
						{LINKS.map(({ id, label, icon, onClick }) => (
							<StyledTextButton key={id} className={id}>
								<FlexDivRowCentered className={id} onClick={onClick}>
									{label}
									{icon}
								</FlexDivRowCentered>
								{id === 'governance' && isGovernanceShown && (
									<StyledMenu>
										{GOVERNANCE.map(({ id, label, onClick }) => (
											<StyledMenuItem key={id} onClick={onClick}>
												{label}
											</StyledMenuItem>
										))}
									</StyledMenu>
								)}
							</StyledTextButton>
						))}
						<StyleFlexDivRow className="socials">
							{SOCIALS.map(({ id, onClick, icon }) => (
								<SocialItem key={id} onClick={onClick}>
									{icon}
								</SocialItem>
							))}
						</StyleFlexDivRow>
					</Links>
					<Link href={ROUTES.Markets.Home}>
						<Button variant="primary" isRounded={false} size="sm">
							{t('homepage.nav.start-trade')}
						</Button>
					</Link>
				</StyleFlexDivCol>
			) : (
				<>
					<Container>
						{menuLinks.map(({ i18nLabel, link }) => (
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
				</>
			)}
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
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
