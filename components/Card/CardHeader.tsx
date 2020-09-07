import React, { FC } from 'react';
import styled from 'styled-components';

import { FlexDivCentered } from 'styles/common';

export type CardHeaderProps = {
	children: React.ReactNode;
	className?: string;
};

const CardHeader: FC<CardHeaderProps> = ({ children, ...rest }) => (
	<Container {...rest}>{children}</Container>
);

const Container = styled(FlexDivCentered)`
	position: relative;
	color: ${(props) => props.theme.colors.white};
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	height: 32px;
	padding: 0 18px;
	justify-content: flex-start;
	text-transform: capitalize;
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
`;

export default CardHeader;
