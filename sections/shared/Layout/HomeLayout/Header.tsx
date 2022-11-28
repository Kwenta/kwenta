import Link from 'next/link';
import router from 'next/router';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ArrowUpRightIcon from 'assets/svg/app/arrow-up-right-tg.svg';
import CaretDownGrayIcon from 'assets/svg/app/caret-down-gray-slim.svg';
import TwitterLogo from 'assets/svg/marketing/twitter-icon.svg';
import DiscordLogo from 'assets/svg/social/discord.svg';
import MirrorLogo from 'assets/svg/social/mirror.svg';
import Button from 'components/Button';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import { FlexDivRow, FlexDivRowCentered, GridDivCenteredCol } from 'styles/common';

import MobileUserMenu from '../AppLayout/Header/MobileUserMenu';
import Logo from '../Logo';

export type TPages = 'landing-page' | 'stats-page';

const Header: FC = () => {
	const { t } = useTranslation();

	const LINKS = useMemo(
		() => [
			{
				id: 'market',
				label: t('homepage.nav.markets'),
				onClick: () => router.push(ROUTES.Dashboard.Markets),
			},
			{
				id: 'stats',
				label: t('homepage.nav.stats'),
				onClick: () => router.push(ROUTES.Stats.Home),
			},
			{
				id: 'governance',
				label: t('homepage.nav.governance.title'),
				icon: <CaretDownGrayIcon />,
			},
			{
				id: 'socials',
				label: t('homepage.nav.socials.title'),
				icon: <CaretDownGrayIcon />,
			},
			{
				id: 'blogs',
				label: t('homepage.nav.blog'),
				icon: <ArrowUpRightIcon />,
				onClick: () => window.open(EXTERNAL_LINKS.Social.Mirror, '_blank'),
			},
			{
				id: 'learn-more',
				label: t('homepage.nav.learn-more'),
				icon: <ArrowUpRightIcon />,
				onClick: () => window.open(EXTERNAL_LINKS.Docs.DocsRoot, '_blank'),
			},
		],
		// eslint-disable-next-line
		[t]
	);

	const GOVERNANCE = [
		{
			id: 'overview',
			label: t('homepage.nav.governance.overview'),
			onClick: () => window.open(EXTERNAL_LINKS.Docs.Governance, '_blank'),
		},
		{
			id: 'kips',
			label: t('homepage.nav.governance.kips'),
			onClick: () => window.open(EXTERNAL_LINKS.Governance.Kips, '_blank'),
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
		<>
			<MobileHiddenView>
				<Container>
					<LogoContainer onClick={() => router.push(ROUTES.Home.Root)}>
						<Logo />
					</LogoContainer>
					<Links>
						{LINKS.map(({ id, label, icon, onClick }) => (
							<StyledTextButton key={id} className={id} onClick={onClick}>
								<FlexDivRowCentered>
									{label}
									{icon}
								</FlexDivRowCentered>
								<StyledMenu className="governance">
									{GOVERNANCE.map(({ id, label, onClick }) => (
										<StyledMenuItem key={id} onClick={onClick}>
											{label}
										</StyledMenuItem>
									))}
								</StyledMenu>
								<StyledMenu className="socials">
									{SOCIALS.map(({ id, label, onClick, icon }) => (
										<StyledMenuItem key={id} onClick={onClick}>
											{icon}
											{label}
										</StyledMenuItem>
									))}
								</StyledMenu>
							</StyledTextButton>
						))}
					</Links>
					<MenuContainer>
						<Link href={ROUTES.Markets.Home(DEFAULT_FUTURES_MARGIN_TYPE)}>
							<Button noOutline size="sm">
								{t('homepage.nav.start-trade')}
							</Button>
						</Link>
					</MenuContainer>
				</Container>
			</MobileHiddenView>
			<MobileOnlyView>
				<MobileContainer>
					<LogoContainer onClick={() => router.push(ROUTES.Dashboard.Markets)}>
						<Logo />
					</LogoContainer>
					<MobileUserMenu />
				</MobileContainer>
			</MobileOnlyView>
		</>
	);
};

const MobileContainer = styled(FlexDivRow)`
	justify-content: center;
	align-items: center;
`;

const LogoContainer = styled.div``;

const StyledMenu = styled.div`
	position: absolute;
	background: ${(props) => props.theme.colors.selectedTheme.cell.fill};
	border: 1px solid rgba(255, 255, 255, 0.1);
	z-index: 10;
	border-radius: 6px;
	width: 120px;
	margin: auto;
	padding: 10px 0px;
	margin-top: 35px;
	display: flex;
	flex-direction: column;
	align-items: center;

	&.governance {
		visibility: hidden;
		transition: visibility 0.1s;
		:hover {
			visibility: visible;
		}
	}

	&.socials {
		visibility: hidden;
		transition: visibility 0.1s;
		:hover {
			visibility: visible;
		}
	}
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
		color: ${(props) => props.theme.colors.selectedTheme.white};
	}
	svg {
		margin-right: 10px;
		width: 15px;
		height: 15px;
	}
`;

const Container = styled.header`
	display: grid;
	align-items: center;
	width: 100%;
	grid-template-columns: 1fr 1fr 1fr;
`;

const Links = styled.div`
	display: flex;
	flex-direction: row;
	white-space: nowrap;
	justify-self: center;
`;

const StyledTextButton = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 15px;
	line-height: 15px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.common.tertiaryGray};
	cursor: pointer;
	padding: 8px 13px;
	border-radius: 100px;

	&:hover {
		background: #252525;
		color: ${(props) => props.theme.colors.selectedTheme.white};
	}

	&.governance:hover {
		> div.governance {
			visibility: visible;
		}
	}

	&.socials:hover {
		> div.socials {
			visibility: visible;
		}
	}

	margin: 0px 20px;
	svg {
		margin-left: 5px;
	}
`;

const MenuContainer = styled(GridDivCenteredCol)`
	grid-gap: 24px;
	justify-self: end;
`;

export default Header;
