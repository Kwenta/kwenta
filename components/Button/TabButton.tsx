import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { Body } from 'components/Text';

import Button from './Button';

export type TabButtonProps = {
	title: string;
	detail?: string;
	badge?: number;
	icon?: any;
	active?: boolean;
	titleIcon?: ReactNode;
	disabled?: boolean;
	noOutline?: boolean;
	vertical?: boolean;
	nofill?: boolean;
	isRounded?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
};

const TabButton: React.FC<TabButtonProps> = React.memo(
	({ title, detail, badge, icon, titleIcon, vertical, nofill, ...props }) => (
		<StyledButton $vertical={vertical} $nofill={nofill} noOutline {...props}>
			{!!icon && <div>{icon}</div>}
			<div>
				<div className="title-container">
					{titleIcon}
					<Body className="title" weight="bold">
						{title}
					</Body>
					{!!badge && <div className="badge">{badge}</div>}
				</div>

				{detail && (
					<Body className="detail" mono weight="bold">
						{detail}
					</Body>
				)}
			</div>
		</StyledButton>
	)
);

const StyledButton = styled(Button).attrs({ size: 'small' })<{
	$vertical?: boolean;
	$nofill?: boolean;
}>`
	height: initial;
	display: flex;
	align-items: center;
	padding-top: 10px;
	padding-bottom: 10px;
	justify-content: center;

	p {
		text-align: left;
	}

	.title-container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	${(props) => css`
		flex-direction: ${props.$vertical ? 'column' : 'row'};
		border-radius: ${props.isRounded ? '100px' : '8px'};
		background-color: ${props.theme.colors.selectedTheme.tab.background[
			props.active ? 'active' : 'inactive'
		]};

		.title {
			text-align: center;
			color: ${props.active
				? props.theme.colors.selectedTheme.button.text.primary
				: props.theme.colors.selectedTheme.gray};
		}

		.detail {
			color: ${props.theme.colors.selectedTheme[props.active ? 'gold' : 'gray']};
			margin-top: 4px;
			font-size: 18px;
		}

		.badge {
			height: 16px;
			width: fit-content;
			min-width: 16px;
			padding-left: 4px;
			padding-right: 4px;
			margin-left: 7px;
			font-size: 13px;
			color: ${props.theme.colors.selectedTheme.black};
			background-color: ${props.theme.colors.selectedTheme.button.tab.badge.background};
			border-radius: 4px;
		}

		svg {
			margin-right: ${props.$vertical ? '0' : '7px'};
			path {
				${props.$nofill ? 'stroke' : 'fill'}: ${props.active
					? props.theme.colors.selectedTheme.button.text.primary
					: props.theme.colors.selectedTheme.gray};
			}
		}

		&:disabled {
			background-color: transparent;
			p {
				color: ${props.theme.colors.selectedTheme.button.tab.disabled.text};
			}
			svg {
				path {
					fill: ${props.theme.colors.selectedTheme.button.tab.disabled.text};
				}
			}

			.badge {
				display: none;
			}
		}
	`}
`;

export default TabButton;
