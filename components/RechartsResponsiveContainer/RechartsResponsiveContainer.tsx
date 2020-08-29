import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import { ResponsiveContainer } from 'recharts';

type RechartsResponsiveContainerProps = {
	aspect?: number;
	width?: string | number;
	height?: string | number;
	minWidth?: string | number;
	minHeight?: string | number;
	maxHeight?: number;
	children: ReactElement;
	debounce?: number;
	id?: string | number;
	className?: string | number;
};

export const RechartsResponsiveContainer: FC<RechartsResponsiveContainerProps> = (props) => (
	<OuterContainer>
		<InnerContainer>
			<ResponsiveContainer {...props} />
		</InnerContainer>
	</OuterContainer>
);

const OuterContainer = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
`;

const InnerContainer = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
`;

export default RechartsResponsiveContainer;
