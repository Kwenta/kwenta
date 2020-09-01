import React, { FC } from 'react';
import styled from 'styled-components';

export type CardBodyProps = {
	children: React.ReactNode;
	className?: string;
};

const CardBody: FC<CardBodyProps> = ({ children, ...rest }) => (
	<Container {...rest}>{children}</Container>
);

const Container = styled.div`
	position: relative;
	padding: 12px 18px;
`;

export default CardBody;
