import { FC, memo } from 'react';
import styled from 'styled-components';

type CardProps = {
	children: React.ReactNode;
	isRounded?: boolean;
	className?: string;
};

const Card: FC<CardProps> = memo(({ children, isRounded, ...rest }) => (
	<Container isRounded={isRounded} {...rest}>
		{children}
	</Container>
));

const Container = styled.div<{ isRounded?: boolean }>`
	display: flex;
	flex-direction: column;
	border-radius: ${(props) => (props.isRounded ? '100px' : '4px')};
`;

export default Card;
