import { FC } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { Svg } from 'react-optimized-image';

import media from 'styles/media';
import {
	FlexDivColCentered,
	PageContent,
	FullScreenContainer,
	ExternalLink,
	GridDivCenteredCol,
} from 'styles/common';

import Logo from 'sections/shared/Layout/Logo';

import { EXTERNAL_LINKS, PROD_HOSTNAME } from 'constants/links';
import { HEADER_HEIGHT } from 'constants/ui';

import SystemDownIcon from 'assets/svg/app/system-down.svg';
import DiscordIcon from 'assets/svg/social/discord.svg';
import TwitterIcon from 'assets/svg/social/twitter.svg';
import GithubIcon from 'assets/svg/social/github.svg';

import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';
import useSynthetixQueries from '@synthetixio/queries';

type SystemStatusProps = {
	children: React.ReactNode;
};

const SOCIAL_LINKS = [
	{
		id: 'discord',
		href: EXTERNAL_LINKS.Social.Discord,
		icon: <Svg src={DiscordIcon} />,
	},
	{
		id: 'twitter',
		href: EXTERNAL_LINKS.Social.Twitter,
		icon: <Svg src={TwitterIcon} />,
	},
	{
		id: 'github',
		href: EXTERNAL_LINKS.Social.GitHub,
		icon: <Svg src={GithubIcon} />,
	},
];

export const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 min

const SystemStatus: FC<SystemStatusProps> = ({ children }) => {
	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);

	const { useIsSystemOnMaintenance } = useSynthetixQueries();

	// current onchain state ( no interval for now, should be added when we are close to a release to save requests )
	const isSystemOnMaintenanceQuery = useIsSystemOnMaintenance({
		refetchInterval: REFRESH_INTERVAL,
	});

	const appOnMaintenance =
		typeof window !== 'undefined' &&
		window.location.hostname === PROD_HOSTNAME &&
		(isSystemOnMaintenanceQuery.isSuccess ? isSystemOnMaintenanceQuery.data : false);

	return appOnMaintenance ? (
		<>
			<Head>
				<title>{t('system-status.page-title')}</title>
			</Head>
			<FullScreenContainer>
				<StyledPageContent>
					<Header>
						<Logo isL2={isL2} />
					</Header>
					<Container>
						<StyledSystemDownIcon src={SystemDownIcon} />
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
	) : (
		<>{children}</>
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

const StyledSystemDownIcon = styled(Svg)`
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
