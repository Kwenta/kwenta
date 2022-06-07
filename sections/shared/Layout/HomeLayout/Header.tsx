import Link from 'next/link';
import router from 'next/router';
import { FC, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ArrowUpRightIcon from 'assets/svg/app/arrow-up-right-tg.svg';
import CaretDownGrayIcon from 'assets/svg/app/caret-down-gray-slim.svg';
import DiscordLogo from 'assets/svg/social/discord.svg';
import MirrorLogo from 'assets/svg/social/mirror.svg';
import TwitterLogo from 'assets/svg/marketing/twitter-icon.svg';
import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Button from 'components/Button';
import { FlexDivRowCentered, GridDivCenteredCol, TextButton } from 'styles/common';
import { isL2State } from 'store/wallet';
import AppHeader from '../AppLayout/Header';
import Logo from '../Logo';

const Header: FC = () => {
	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);
	const [isGovernanceShown, setIsGovernanceShown] = useState(false);
	const [isSocialsShown, setIsSocialsShown] = useState(false);

	const LINKS = useMemo(
		() => [
			{
				key: 'market',
				label: t('homepage.nav.markets'),
				onClick: () => router.push(ROUTES.Home.Markets),
			},
			{
				key: 'governance',
				label: t('homepage.nav.governance.title'),
				icon: <CaretDownGrayIcon />,
				show: () => {
					setIsSocialsShown(false);
					setIsGovernanceShown(true);
				},
			},
			{
				key: 'socials',
				label: t('homepage.nav.socials.title'),
				icon: <CaretDownGrayIcon />,
				show: () => {
					setIsGovernanceShown(false);
					setIsSocialsShown(true);
				},
			},
			{
				key: 'blogs',
				label: t('homepage.nav.blog'),
				icon: <ArrowUpRightIcon />,
				onClick: () => window.open(EXTERNAL_LINKS.Social.Mirror, '_blank'),
			},
		],
		// eslint-disable-next-line
		[t]
	);

	const GOVERNANCE = [
		{
			key: 'overview',
			label: t('homepage.nav.governance.overview'),
			onClick: () => window.open(EXTERNAL_LINKS.Docs.Governance, '_blank'),
		},
		{
			key: 'kips',
			label: t('homepage.nav.governance.kips'),
			onClick: () => window.open(EXTERNAL_LINKS.Kips.Home, '_blank'),
		},
	];

	const SOCIALS = [
		{
			key: 'discord',
			label: t('homepage.nav.socials.discord'),
			onClick: () => window.open(EXTERNAL_LINKS.Social.Discord, '_blank'),
			icon: <DiscordLogo />,
		},
		{
			key: 'twitter',
			label: t('homepage.nav.socials.twitter'),
			onClick: () => window.open(EXTERNAL_LINKS.Social.Twitter, '_blank'),
			icon: <TwitterLogo />,
		},
		{
			key: 'mirror',
			label: t('homepage.nav.socials.mirror'),
			onClick: () => window.open(EXTERNAL_LINKS.Social.Mirror, '_blank'),
			icon: <MirrorLogo />,
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
						{LINKS.map(({ key, label, icon, onClick, show }) => (
							<StyledTextButton key={key} onClick={onClick} onMouseEnter={show}>
								<FlexDivRowCentered>
									{label}
									{icon}
								</FlexDivRowCentered>
								{key === 'governance' && isGovernanceShown && (
									<StyledMenu
										onMouseLeave={() => {
											setIsGovernanceShown(false);
										}}
									>
										{GOVERNANCE.map(({ key, label, onClick }) => (
											<StyledMenuItem key={key} onClick={onClick}>
												{label}
											</StyledMenuItem>
										))}
									</StyledMenu>
								)}
								{key === 'socials' && isSocialsShown && (
									<StyledMenu
										onMouseLeave={() => {
											setIsSocialsShown(false);
										}}
									>
										{SOCIALS.map(({ key, label, onClick, icon }) => (
											<StyledMenuItem key={key} onClick={onClick}>
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
						<Link href={ROUTES.Markets.Home}>
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
