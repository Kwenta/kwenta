import Link from 'next/link';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

import { linkCSS } from 'styles/common';

type NavButtonProps = {
	title: string;
	isActive: boolean;
	href: string;
	disabled?: boolean;
	external?: boolean;
	children?: ReactNode;
};

const NavButton: React.FC<NavButtonProps> = ({ title, href, external, disabled, ...props }) => {
	return (
		<div>
			<Link href={href} passHref>
				<StyledLink
					target={external ? '_blank' : '_self'}
					className={disabled ? 'disabled' : undefined}
					{...props}
				>
					{title}
				</StyledLink>
			</Link>
		</div>
	);
};

const StyledLink = styled.a<{ isActive: boolean; disabled?: boolean }>`
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

	&.disabled {
		color: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
		background: transparent;
		pointer-events: none;
	}
`;

export default NavButton;
