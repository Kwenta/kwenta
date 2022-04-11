import React from 'react';
import styled from 'styled-components';
import Button from './Button';

type NavButtonProps = {
	title: string;
	isActive: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
	disabled?: boolean;
	noOutline?: boolean;
};

const NavButton: React.FC<NavButtonProps> = ({ title, ...props }) => {
	return (
		<div>
			<StyledButton {...props}>
				<p className="title">{title}</p>
			</StyledButton>
		</div>
	);
};

const StyledButton = styled(Button)`
	height: initial;
	display: flex;

	margin-top: 8px;
	margin-bottom: 8px;

	padding-top: 10px;
	padding-bottom: 10px;

	border: transparent;
	background: ${(props) =>
		props.isActive ? props.theme.colors.selectedTheme.button.background : 'transparent'};
	box-shadow: none;

	p {
		margin: 0;
		font-size: 15px;
		text-align: left;
	}

	.title {
		color: ${(props) =>
			props.isActive
				? props.theme.colors.common.primaryWhite
				: props.theme.colors.common.secondaryGray};
	}

	&:disabled {
		background-color: transparent;

		p {
			color: ${(props) => props.theme.colors.selectedTheme.button.tab.disabled.text};
		}

		border: transparent;

		.badge {
			display: none;
		}
	}
`;

export default NavButton;
