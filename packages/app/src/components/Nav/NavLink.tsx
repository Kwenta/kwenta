import Link from 'next/link'
import React, { ReactNode } from 'react'
import styled, { css } from 'styled-components'

import LinkIconLight from 'assets/svg/app/link-light.svg'
import { FlexDivRowCentered } from 'components/layout/flex'
import { linkCSS } from 'styles/common'

type NavButtonProps = {
	title: string
	isActive: boolean
	href: string
	disabled?: boolean
	external?: boolean
	children?: ReactNode
}

const NavButton: React.FC<NavButtonProps> = ({ title, href, external, disabled, ...props }) => {
	return (
		<div>
			{external ? (
				<StyledLink
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className={disabled ? 'disabled' : undefined}
					{...props}
				>
					<FlexDivRowCentered columnGap="5px">
						{title} <LinkIconLight />
					</FlexDivRowCentered>
				</StyledLink>
			) : (
				<StyledLink href={href} {...props}>
					{title}
				</StyledLink>
			)}
		</div>
	)
}

const StyledLink = styled(Link)<{ isActive: boolean; disabled?: boolean }>`
	${linkCSS};
	display: inline-block;
	padding: 10px 14px;
	margin: 8px 0;
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 15px;
	text-transform: capitalize;
	border-radius: 100px;
	background: ${(props) =>
		props.isActive ? props.theme.colors.selectedTheme.button.fill : 'transparent'};
	color: ${(props) =>
		props.isActive
			? props.theme.colors.selectedTheme.button.text.primary
			: props.theme.colors.selectedTheme.gray};
	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.button.fill};
	}

	${(props) =>
		props.disabled &&
		css`
			color: ${props.theme.colors.selectedTheme.button.disabled.text};
			background: transparent;
			pointer-events: none;
		`}
`

export default NavButton
