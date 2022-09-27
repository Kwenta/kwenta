import React from 'react';
import styled, { css } from 'styled-components';

import Button from './Button';

export type TabButtonProps = {
	title: string;
	detail?: string;
	badge?: number;
	icon?: any;
	active?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
	disabled?: boolean;
	noOutline?: boolean;
	vertical?: boolean;
	nofill?: boolean;
	isRounded?: boolean;
	lightStakePage?: boolean;
};

const TabButton: React.FC<TabButtonProps> = React.memo(
	({ title, detail, badge, active, icon, vertical, nofill, ...props }) => (
		<StyledButton {...props} {...{ active, vertical, nofill }} noOutline>
			{!!icon && <div>{icon}</div>}
			<div>
				<div className="title-container">
					<p className="title">{title}</p>
					{!!badge && <div className="badge">{badge}</div>}
				</div>

				{detail && <p className="detail">{detail}</p>}
			</div>
		</StyledButton>
	)
);

const StyledButton = styled(Button)<{
	active?: boolean;
	vertical?: boolean;
	nofill?: boolean;
	lightStakePage?: boolean;
}>`
	height: initial;
	display: flex;
	align-items: center;
	border-radius: ${(props) => (props.isRounded ? '100px' : '8px')};
	padding-top: 10px;
	padding-bottom: 10px;
	justify-content: center;
	${(props) =>
		!props.lightStakePage
			? css`
					background-color: ${props.active
						? props.theme.colors.selectedTheme.tab.background.active
						: props.theme.colors.selectedTheme.tab.background.inactive};
					.title {
						text-align: center;
						color: ${props.active
							? props.theme.colors.selectedTheme.button.text.primary
							: props.theme.colors.selectedTheme.gray};
					}
			  `
			: css`
					background-color: ${props.active ? '#393939' : '#F2F2F2'};
					.title {
						text-align: center;
						color: ${props.active ? '#F2F2F2' : '#3F3F3F'};
					}
			  `}
	p {
		margin: 0;
		font-size: 13px;
		text-align: left;
	}
	.title-container {
		display: flex;
		flex-direction: row;
	}

	.detail {
		color: ${(props) =>
			props.active ? props.theme.colors.selectedTheme.gold : props.theme.colors.selectedTheme.gray};
		margin-top: 4px;
		font-size: 18px;
		font-family: ${(props) => props.theme.fonts.monoBold};
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
		margin-right: ${(props) => (props.vertical ? '0' : '7px')};
		path {
			${(props) =>
				css`
					${props.nofill ? 'stroke' : 'fill'}: ${props.active
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

	${(props) =>
		props.vertical &&
		css`
			display: flex;
			flex-direction: ${props.vertical ? 'column' : 'row'};
			align-items: center;
		`}
`;
export default TabButton;
