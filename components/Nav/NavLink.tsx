import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

import { linkCSS } from 'styles/common';

type NavButtonProps = {
	title: string;
	isActive: boolean;
	href: string;
	disabled?: boolean;
	noOutline?: boolean;
	external?: boolean;
};

const NavButton: React.FC<NavButtonProps> = ({ title, href, external, ...props }) => {
	return (
		<div>
			<Link href={href}>
				<a target={external ? '_blank' : '_self'}>
					<StyledLink {...props}>{title}</StyledLink>
				</a>
			</Link>
		</div>
	);
};

const StyledLink = styled.p<{ isActive: boolean }>`
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
	cursor: pointer;
	color: ${(props) =>
		props.isActive
			? props.theme.colors.selectedTheme.button.text.primary
			: props.theme.colors.selectedTheme.gray};
	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.button.fill};
	}
`;

export default NavButton;
