import { FC, useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import media from 'styles/media';
import {
	FlexDivColCentered,
	PageContent,
	FullScreenContainer,
	ExternalLink,
	GridDivCenteredCol,
} from 'styles/common';

import Logo from 'sections/shared/Layout/Logo';

import { EXTERNAL_LINKS } from 'constants/links';
import { HEADER_HEIGHT } from 'constants/ui';

import SystemDownIcon from 'assets/inline-svg/app/system-down.svg';
import DiscordIcon from 'assets/inline-svg/social/discord.svg';
import TwitterIcon from 'assets/inline-svg/social/twitter.svg';
import GithubIcon from 'assets/inline-svg/social/github.svg';

// import Services from 'containers/Services';
import useIsSystemUpgrading from 'queries/systemStatus/useIsSystemUpgrading';

type SystemStatusProps = {
	children: React.ReactNode;
};

const SOCIAL_LINKS = [
	{
		id: 'discord',
		href: EXTERNAL_LINKS.Social.Discord,
		icon: <DiscordIcon />,
	},
	{
		id: 'twitter',
		href: EXTERNAL_LINKS.Social.Twitter,
		icon: <TwitterIcon />,
	},
	{
		id: 'github',
		href: EXTERNAL_LINKS.Social.GitHub,
		icon: <GithubIcon />,
	},
];

// const IS_PROD = !!process.env.NEXT_PUBLIC_IS_PROD;

const SystemStatus: FC<SystemStatusProps> = ({ children }) => {
	const { t } = useTranslation();
	const [appOnMaintenance, setAppOnMaintenance] = useState<boolean>(false);
	// const { systemSuspended$, systemResumed$ } = Services.useContainer();

	// current onchain state
	const isSystemUpgradingQuery = useIsSystemUpgrading({ refetchInterval: false });

	// note: using an effect for `isSystemUpgradingQuery` is not mandatory, its only to make it consistent with the events.
	useEffect(() => {
		if (isSystemUpgradingQuery.data != null) {
			setAppOnMaintenance(isSystemUpgradingQuery.data);
		}
	}, [isSystemUpgradingQuery.data]);

	/*

	events are disabled for now since they fire too many requests to infura...

	useEffect(() => {
		if (IS_PROD && systemSuspended$) {
			const subscription = systemSuspended$.subscribe(() => {
				setAppOnMaintenance(true);
			});
			return () => subscription.unsubscribe();
		}
	}, [systemSuspended$]);

	useEffect(() => {
		if (IS_PROD && systemResumed$) {
			const subscription = systemResumed$.subscribe(() => {
				setAppOnMaintenance(false);
			});
			return () => subscription.unsubscribe();
		}
	}, [systemResumed$]);
	*/

	if (!appOnMaintenance) {
		return <>{children}</>;
	}

	return (
		<>
			<Head>
				<title>{t('system-status.page-title')}</title>
			</Head>
			<FullScreenContainer>
				<StyledPageContent>
					<Header>
						<Logo />
					</Header>
					<Container>
						<StyledSystemDownIcon />
						<Title>{t('system-status.title')}</Title>
						<Subtitle>{t('system-status.subtitle')}</Subtitle>
						<Links>
							{SOCIAL_LINKS.map(({ id, href, icon }) => (
								<StyledExternalLink key={id} href={href}>
									{icon}
								</StyledExternalLink>
							))}
						</Links>
					</Container>
				</StyledPageContent>
			</FullScreenContainer>
		</>
	);
};

const Header = styled.header`
	height: ${HEADER_HEIGHT};
	line-height: ${HEADER_HEIGHT};
`;

const StyledPageContent = styled(PageContent)`
	display: flex;
	flex-direction: column;
`;

const Container = styled(FlexDivColCentered)`
	flex-grow: 1;
	justify-content: center;
	display: flex;
	align-items: center;
	text-align: center;
	margin-top: -${HEADER_HEIGHT};
`;

// @ts-ignore
const StyledSystemDownIcon = styled(SystemDownIcon)`
	margin-bottom: 51px;
	${media.lessThan('sm')`
		svg {
			margin-bottom: 46px;
		}
	`}
`;

const titleCSS = css`
	font-size: 20px;
	margin: 0;
	font-weight: normal;
	line-height: normal;

	font-family: ${(props) => props.theme.fonts.mono};
`;

const Title = styled.h1`
	${titleCSS};
	font-size: 20px;
	color: ${(props) => props.theme.colors.white};
	padding-bottom: 15px;
	line-height: 28px;
`;

const Subtitle = styled.h2`
	${titleCSS};
	font-size: 16px;
	color: ${(props) => props.theme.colors.silver};
`;

const Links = styled(GridDivCenteredCol)`
	grid-gap: 24px;
	position: relative;
	top: 130px;
	${media.lessThan('sm')`
		top: 90px;
	`}
`;

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.silver};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
`;

export default SystemStatus;
