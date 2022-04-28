import React from 'react';
import styled from 'styled-components';
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
};

const TabButton: React.FC<TabButtonProps> = ({ title, detail, badge, active, icon, ...props }) => {
	return (
		<StyledButton {...props} isActive={!!active}>
			<div>
				<p className="title">{title}</p>
				{detail && <p className="detail">{detail}</p>}
			</div>
			{!!icon && <div>{icon}</div>}
			{!!badge && <div className="badge">{badge}</div>}
		</StyledButton>
	);
};

const StyledButton = styled(Button)<{ isActive: boolean }>`
	height: initial;
	display: flex;
	align-items: center;
	padding-top: 10px;
	padding-bottom: 10px;
	justify-content: center;
	p {
		margin: 0;
		font-size: 13px;
		text-align: left;
	}
	.title {
		text-align: center;
		color: ${(props) =>
			props.isActive
				? props.theme.colors.common.primaryWhite
				: props.theme.colors.common.secondaryGray};
	}
	.detail {
		color: ${(props) => props.theme.colors.common.secondaryGray};
		margin-top: 2px;
	}
	.badge {
		height: 16px;
		width: fit-content;
		min-width: 16px;
		padding-left: 4px;
		padding-right: 4px;
		margin-left: 7px;
		font-size: 12px;
		color: ${(props) => props.theme.colors.selectedTheme.button.tab.badge.text};
		background-color: ${(props) => props.theme.colors.selectedTheme.button.tab.badge.background};
		box-shadow: ${(props) => props.theme.colors.selectedTheme.button.tab.badge.shadow};
		border-radius: 4px;
	}

	svg {
		margin-left: 5px;
		margin-top: 5px;
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

		border: none;
		.badge {
			display: none;
		}
	}
`;
export default TabButton;
