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
		<StyledButton {...props} isActive={!!active} noOutline={true}>
			{!!icon && <div>{icon}</div>}
			<div>
				<div className="title-container">
					<p className="title">{title}</p>
					{!!badge && <div className="badge">{badge}</div>}
				</div>

				{detail && <p className="detail">{detail}</p>}
			</div>
		</StyledButton>
	);
};

const StyledButton = styled(Button)<{ isActive: boolean }>`
	display: flex;
	align-items: center;
	padding-top: 10px;
	padding-bottom: 10px;
	justify-content: center;
	background-color: ${(props) => !props.isActive && 'transparent'};
	p {
		margin: 0;
		font-size: 13px;
		text-align: left;
	}
	.title-container {
		display: flex;
		flex-direction: row;
	}
	.title {
		text-align: center;
		color: ${(props) =>
			props.isActive
				? props.theme.colors.selectedTheme.button.text
				: props.theme.colors.selectedTheme.gray};
	}
	.detail {
		color: ${(props) =>
			props.isActive
				? props.theme.colors.selectedTheme.gold
				: props.theme.colors.selectedTheme.gray};
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

	svg:first-child {
		margin-right: 7px;
	}

	svg {
		path {
			fill: ${(props) =>
				props.isActive
					? props.theme.colors.selectedTheme.button.text
					: props.theme.colors.selectedTheme.gray};
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
