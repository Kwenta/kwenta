import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import ROUTES from 'constants/routes';

import DiscordLogo from 'assets/svg/social/discord.svg';
import MediumLogo from 'assets/svg/marketing/medium-icon.svg';
import TwitterLogo from 'assets/svg/marketing/twitter-icon.svg';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Button from 'components/Button';

import UserMenu from '../AppLayout/Header/UserMenu';
import AppHeader from '../AppLayout/Header';
import Logo from '../Logo';
import { FlexDivRowCentered, GridDivCenteredCol, TextButton } from 'styles/common';
import ArrowUpRightIcon from 'assets/svg/app/arrow-up-right-tg.svg';
import CaretDownGrayIcon from 'assets/svg/app/caret-down-gray-slim.svg';

import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';
import router from 'next/router';
import { EXTERNAL_LINKS } from 'constants/links';

const Header: FC = () => {
	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);
	const [isGovernanceShown, setIsGovernanceShown] = useState(false);
	const [isSocialsShown, setIsSocialsShown] = useState(false);

	const LINKS = useMemo(
		() => [
			{
				id: 'market',
				label: t('homepage.nav.markets'),
				onClick: () => router.push(ROUTES.Markets.Home),
			},
			{
				id: 'governance',
				label: t('homepage.nav.governance'),
				icon: <CaretDownGrayIcon />,
				show: () => {
					setIsSocialsShown(false);
					setIsGovernanceShown(true);
				},
			},
			{
				id: 'socials',
				label: t('homepage.nav.socials'),
				icon: <CaretDownGrayIcon />,
				show: () => {
					setIsGovernanceShown(false);
					setIsSocialsShown(true);
				},
			},
			{
				id: 'blogs',
				label: t('homepage.nav.blog'),
				icon: <ArrowUpRightIcon />,
				onClick: () => window.open(EXTERNAL_LINKS.Social.Mirror, '_blank'),
			},
		],
		// eslint-disable-next-line
		[t]
	);

	const GOVERNANCE = [
		{ label: 'Doc', onClick: () => window.open(EXTERNAL_LINKS.Docs.Governance, '_blank') },
		{ label: 'KIPs', onClick: () => window.open(EXTERNAL_LINKS.Kips.Home, '_blank') },
	];

	const SOCIALS = [
		{
			label: 'Discord',
			onClick: () => window.open(EXTERNAL_LINKS.Social.Discord, '_blank'),
			icon: <DiscordLogo />,
		},
		{
			label: 'Twitter',
			onClick: () => window.open(EXTERNAL_LINKS.Social.Twitter, '_blank'),
			icon: <TwitterLogo />,
		},
		{
			label: 'Mirror',
			onClick: () => window.open(EXTERNAL_LINKS.Social.Mirror, '_blank'),
			icon: <MediumLogo />,
		},
	];

	return (
		<>
			<MobileHiddenView>
				<Container>
					<LogoContainer>
						<Logo isL2={isL2} isHomePage={true} />
					</LogoContainer>

					<Links>
						{LINKS.map(({ id, label, icon, onClick, show }) => (
							<StyledTextButton key={id} onClick={onClick} onMouseEnter={show}>
								<FlexDivRowCentered>
									{label}
									{icon}
								</FlexDivRowCentered>
								{id === 'governance' && isGovernanceShown && (
									<StyledMenu
										onMouseLeave={() => {
											setIsGovernanceShown(false);
										}}
									>
										{GOVERNANCE.map(({ label, onClick }) => (
											<StyledMenuItem onClick={onClick}>{label}</StyledMenuItem>
										))}
									</StyledMenu>
								)}
								{id === 'socials' && isSocialsShown && (
									<StyledMenu
										onMouseLeave={() => {
											setIsSocialsShown(false);
										}}
									>
										{SOCIALS.map(({ label, onClick, icon }) => (
											<StyledMenuItem onClick={onClick}>
												{icon}
												{label}
											</StyledMenuItem>
										))}
									</StyledMenu>
								)}
							</StyledTextButton>
						))}
					</Links>
					<MenuContainer>
						<UserMenu />
						<Link href={ROUTES.Home.Overview}>
							<Button variant="primary" isRounded={false} size="sm">
								{t('homepage.nav.start-trade')}
							</Button>
						</Link>
					</MenuContainer>
				</Container>
			</MobileHiddenView>
			<MobileOnlyView>
				<AppHeader />
			</MobileOnlyView>
		</>
	);
};

const LogoContainer = styled.div`
	padding-top: 8px;
`;

const StyledMenu = styled.div`
	position: absolute;
	background: linear-gradient(180deg, #1e1d1d 0%, #161515 100%);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	width: 120px;
	margin: auto;
	padding: 10px 0px;
	margin-top: 35px;
	display: flex;
	flex-direction: column;
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

const Container = styled.header`
	display: grid;
	align-items: start;
	width: 100%;
	grid-template-columns: 1fr 1fr 1fr;
`;

const Links = styled.div`
	display: flex;
	flex-direction: row;
	white-space: nowrap;
	justify-self: center;
	padding-top: 10px;
`;

const StyledTextButton = styled(TextButton)`
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 15px;
	line-height: 15px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.common.tertiaryGray};
	margin: 0px 20px;
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
	svg {
		margin-left: 5px;
	}
`;

const MenuContainer = styled(GridDivCenteredCol)`
	grid-gap: 24px;
	justify-self: end;
`;

export default Header;
