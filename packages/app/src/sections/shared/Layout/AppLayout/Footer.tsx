import router from 'next/router'
import styled from 'styled-components'

import DocsIcon from 'assets/svg/app/docs.svg'
import StatsIcon from 'assets/svg/app/stats.svg'
import SupportIcon from 'assets/svg/app/support.svg'
import { FlexDivRow } from 'components/layout/flex'
import { Body } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import ROUTES from 'constants/routes'
import { FOOTER_HEIGHT } from 'styles/common'

import GitHashID from './GitHashID'
import OperationStatus from './OperationStatus'

const Footer = () => {
	return (
		<FooterContainer>
			<OperationStatus />
			<GitHashID />
			<RightContainer>
				<FooterLinkInternal onClick={() => router.push(ROUTES.Stats.Home)}>
					<StatsIcon />
					<Body color="secondary">Stats</Body>
				</FooterLinkInternal>
				<FooterLink href={EXTERNAL_LINKS.Docs.DocsRoot}>
					<DocsIcon />
					<Body color="secondary">Docs</Body>
				</FooterLink>
				<FooterLink href={EXTERNAL_LINKS.Social.Discord}>
					<SupportIcon />
					<Body color="secondary">Support</Body>
				</FooterLink>
			</RightContainer>
		</FooterContainer>
	)
}

const FooterContainer = styled.footer`
	display: grid;
	z-index: 120;
	grid-template-columns: repeat(3, 1fr);
	align-items: center;
	padding: 0 10px;
	height: ${FOOTER_HEIGHT}px;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.primary.background};
`

const RightContainer = styled.div`
	display: flex;
	justify-content: flex-end;
`

const FooterLink = styled.a.attrs({ target: '_blank', rel: '_noreferrer' })`
	&:not(:last-of-type) {
		margin-right: 18px;
	}
	display: flex;
	flex-direction: row;
	align-items: center;
	column-gap: 5px;
`

const FooterLinkInternal = styled(FlexDivRow)`
	margin-right: 18px;
	cursor: pointer;
	align-items: center;
	column-gap: 5px;
`

export default Footer
