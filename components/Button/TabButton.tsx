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
					<Body className="title">{title}</Body>
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
	flex-direction: ${(props) => (props.$vertical ? 'column' : 'row')};
	align-items: center;
	border-radius: ${(props) => (props.isRounded ? '100px' : '8px')};
	padding-top: 10px;
	padding-bottom: 10px;
	justify-content: center;
	background-color: ${(props) =>
		props.active
			? props.theme.colors.selectedTheme.tab.background.active
			: props.theme.colors.selectedTheme.tab.background.inactive};

	p {
		text-align: left;
	}

	.title-container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.title {
		text-align: center;
		color: ${(props) =>
			props.active
				? props.theme.colors.selectedTheme.button.text.primary
				: props.theme.colors.selectedTheme.gray};
	}

	.detail {
		color: ${(props) => props.theme.colors.selectedTheme[props.active ? 'gold' : 'gray']};
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
		color: ${(props) => props.theme.colors.selectedTheme.black};
		background-color: ${(props) => props.theme.colors.selectedTheme.button.tab.badge.background};
		border-radius: 4px;
	}

	svg {
		margin-right: ${(props) => (props.$vertical ? '0' : '7px')};
		path {
			${(props) =>
				css`
					${props.$nofill ? 'stroke' : 'fill'}: ${props.active
						? props.theme.colors.selectedTheme.button.text.primary
						: props.theme.colors.selectedTheme.gray};
				`}
		}
	}

	&:disabled {
		background-color: transparent;
		p {
			color: ${(props) => props.theme.colors.selectedTheme.button.tab.disabled.text};
		}
		svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.button.tab.disabled.text};
			}
		}

		.badge {
			display: none;
		}
	}
`;

export default TabButton;
