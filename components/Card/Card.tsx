import React, { FC } from 'react';
import styled from 'styled-components';

import CardBody, { CardBodyProps } from './CardBody';
import CardHeader, { CardHeaderProps } from './CardHeader';

type CardProps = {
	children: React.ReactNode;
	isRounded?: boolean;
	className?: string;
};

interface StaticComponents {
	Header: FC<CardHeaderProps>;
	Body: FC<CardBodyProps>;
}

// @ts-ignore
const Card: FC<CardProps> & StaticComponents = React.memo(({ children, isRounded, ...rest }) => (
	<Container isRounded={isRounded} {...rest}>
		{children}
	</Container>
));

Card.Header = CardHeader;
Card.Body = CardBody;

const Container = styled.div<{ isRounded?: boolean }>`
	display: flex;
	flex-direction: column;
	border-radius: ${(props) => (props.isRounded ? '100px' : '4px')};
`;

export default Card;
