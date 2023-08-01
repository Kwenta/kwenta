import React, { ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { FlexDivRowCentered } from 'components/layout/flex'
import { Body } from 'components/Text'

import Button from './Button'

export type TabButtonProps = {
	title: string
	detail?: string
	badgeCount?: number
	icon?: any
	iconOnly?: boolean
	active?: boolean
	titleIcon?: ReactNode
	disabled?: boolean
	inline?: boolean
	vertical?: boolean
	nofill?: boolean
	isRounded?: boolean
	onClick?: () => any
	flat?: boolean
}

const InnerButton: React.FC<TabButtonProps> = React.memo(
	({ title, detail, badgeCount, icon, titleIcon }) => (
		<FlexDivRowCentered>
			{!!icon && <div>{icon}</div>}
			<div>
				<div className="title-container">
					{titleIcon}
					<Body className="title" weight="bold">
						{title}
					</Body>
					{!!badgeCount && (
						<Body mono weight="bold" className="badge">
							{badgeCount}
						</Body>
					)}
				</div>

				{detail && (
					<Body className="detail" mono weight="bold">
						{detail}
					</Body>
				)}
			</div>
		</FlexDivRowCentered>
	)
)

const TabButton: React.FC<TabButtonProps> = React.memo(
	({ active, flat = false, onClick, iconOnly, icon, ...props }) =>
		props.inline ? (
			<InlineTab active={active} onClick={onClick} $iconOnly={iconOnly}>
				{iconOnly && icon ? <div>{icon}</div> : <InnerButton icon={icon} {...props} />}
			</InlineTab>
		) : (
			<StyledButton
				active={active}
				$vertical={props.vertical}
				$nofill={props.nofill}
				$flat={flat}
				$isRounded={props.isRounded}
				onClick={onClick}
			>
				<InnerButton {...props} />
			</StyledButton>
		)
)

const sharedStyle = css<{
	active?: boolean
	$iconOnly?: boolean
	$vertical?: boolean
	$nofill?: boolean
	$flat?: boolean
}>`
	height: initial;
	display: flex;
	align-items: center;
	padding-top: 10px;
	padding-bottom: 10px;
	justify-content: center;

	.title-container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	background-color: ${(props) =>
		props.active
			? props.theme.colors.selectedTheme.newTheme.button.default.background
			: 'transparent'};

	.badge {
		height: 16px;
		width: fit-content;
		min-width: 16px;
		padding-left: 4px;
		padding-right: 4px;
		margin-left: 7px;
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.black};
		background-color: ${(props) =>
			props.theme.colors.selectedTheme.newTheme.badge.yellow.background};
		border-radius: 4px;
	}

	&:disabled {
		background-color: transparent;
		p {
			color: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
		}
		svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
			}
		}

		.badge {
			display: none;
		}
	}

	&:hover {
		background: ${(props) =>
			props.theme.colors.selectedTheme.newTheme.button.default.hover.background};
		border-width: 1px;
	}

	.title {
		text-align: center;
		color: ${(props) =>
			props.active
				? props.theme.colors.selectedTheme.button.text.primary
				: props.theme.colors.selectedTheme.newTheme.text.secondary};
	}

	.detail {
		color: ${(props) => props.theme.colors.selectedTheme[props.active ? 'yellow' : 'gray']};
		margin-top: 4px;
		font-size: 18px;
	}

	svg {
		margin-top: 2px;
		margin-right: ${(props) => (props.$vertical || props.$iconOnly ? '0' : '7px')};
		path {
			${(props) => (props.$nofill ? 'stroke' : 'fill')}: ${(props) =>
				props.active
					? props.theme.colors.selectedTheme.button.text.primary
					: props.theme.colors.selectedTheme.gray};
		}
	}

	${(props) =>
		props.$flat &&
		css`
			border-radius: 0;
			border: unset;
			height: 100%;
			width: 100%;

			&:not(:last-of-type) {
				border-right: ${props.theme.colors.selectedTheme.border};
			}
		`}
`

const InlineTab = styled.div<{
	active?: boolean
	$iconOnly?: boolean
}>`
	${sharedStyle}
	cursor: pointer;
	border-right: ${(props) => props.theme.colors.selectedTheme.border};
	padding: 0px 20px;
	transition: all 0.1s ease-in-out;
`

const StyledButton = styled(Button).attrs({ size: 'small' })<{
	$vertical?: boolean
	$isRounded?: boolean
	$nofill?: boolean
	$flat?: boolean
}>`
	p {
		text-align: left;
	}

	${(props) => css`
		flex-direction: ${props.$vertical ? 'column' : 'row'};
		border-radius: ${props.$isRounded ? '100px' : '8px'};
	`}
	${sharedStyle}
`

export default TabButton
