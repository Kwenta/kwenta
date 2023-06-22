import Head from 'next/head'
import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import SystemDownIcon from 'assets/svg/app/system-down.svg'
import DiscordIcon from 'assets/svg/social/discord.svg'
import GithubIcon from 'assets/svg/social/github.svg'
import TwitterIcon from 'assets/svg/social/twitter.svg'
import { FlexDivColCentered } from 'components/layout/flex'
import { GridDivCenteredCol } from 'components/layout/grid'
import { EXTERNAL_LINKS, PROD_HOSTNAME } from 'constants/links'
import { HEADER_HEIGHT } from 'constants/ui'
import Logo from 'sections/shared/Layout/Logo'
import { useAppSelector } from 'state/hooks'
import { PageContent, ExternalLink } from 'styles/common'
import media from 'styles/media'

type SystemStatusProps = {
	children: React.ReactNode
}

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
]

const SystemStatus: FC<SystemStatusProps> = memo(({ children }) => {
	const { t } = useTranslation()

	const synthetixOnMaintenance = useAppSelector(({ app }) => app.synthetixOnMaintenance)

	const appOnMaintenance =
		typeof window !== 'undefined' &&
		window.location.hostname === PROD_HOSTNAME &&
		synthetixOnMaintenance

	return appOnMaintenance ? (
		<>
			<Head>
				<title>{t('system-status.page-title')}</title>
			</Head>
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
		</>
	) : (
		<>{children}</>
	)
})

const Header = styled.header`
	height: ${HEADER_HEIGHT};
	line-height: ${HEADER_HEIGHT};
`

const StyledPageContent = styled(PageContent)`
	display: flex;
	flex-direction: column;
`

const Container = styled(FlexDivColCentered)`
	flex-grow: 1;
	justify-content: center;
	display: flex;
	align-items: center;
	text-align: center;
	margin-top: -${HEADER_HEIGHT};
`

const StyledSystemDownIcon = styled(SystemDownIcon)`
	margin-bottom: 51px;
	${media.lessThan('sm')`
		svg {
			margin-bottom: 46px;
		}
	`}
`

const titleCSS = css`
	font-size: 20px;
	margin: 0;
	line-height: normal;

	font-family: ${(props) => props.theme.fonts.mono};
`

const Title = styled.h1`
	${titleCSS};
	font-size: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	padding-bottom: 15px;
	line-height: 28px;
`

const Subtitle = styled.h2`
	${titleCSS};
	font-size: 16px;
	color: ${(props) => props.theme.colors.silver};
`

const Links = styled(GridDivCenteredCol)`
	grid-gap: 24px;
	position: relative;
	top: 130px;
	${media.lessThan('sm')`
		top: 90px;
	`}
`

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.silver};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
`

export default SystemStatus
