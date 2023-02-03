import { FC, memo } from 'react';
import styled from 'styled-components';

import { FlexDivCol } from 'components/layout/flex';

export type CardBodyProps = {
	children: React.ReactNode;
	className?: string;
};

const CardBody: FC<CardBodyProps> = memo(({ children, ...rest }) => (
	<Container {...rest}>{children}</Container>
));

const Container = styled(FlexDivCol)`
	position: relative;
	padding: 12px 18px;
`;

export default CardBody;
