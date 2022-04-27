import React from 'react';
import ImgSrc, { Svg } from 'react-optimized-image';
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
	icon?: ImgSrc;
};

const TabButton: React.FC<TabButtonProps> = ({ title, detail, badge, active, icon, ...props }) => {
	return (
		<StyledButton {...props}>
			<div>
				<p className="title">{title}</p>
				{detail && <p className="detail">{detail}</p>}
			</div>
			{!!icon && <Svg src={icon} />}
			{!!badge && <div className="badge">{badge}</div>}
			{icon ? <img className="icon" src={`${icon}`} height={'15px'} width={'auto'} /> : ''}
		</StyledButton>
	);
};

const StyledButton = styled(Button)`
	height: initial;
	display: flex;
	align-items: center;

	padding-top: 10px;
	padding-bottom: 10px;

	p {
		margin: 0;
		font-size: 13px;
		text-align: left;
	}

	.title {
		text-align: center;
		color: ${(props) => props.theme.colors.common.primaryWhite};
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

	.icon {
		margin-left: 6px;
	}

	&:disabled {
		background-color: transparent;

		p {
			color: ${(props) => props.theme.colors.selectedTheme.button.tab.disabled.text};
		}

		/* border: ${(props) => props.theme.colors.selectedTheme.button.tab.disabled.border}; */
		border: none;

		.badge {
			display: none;
		}
	}
`;

export default TabButton;
