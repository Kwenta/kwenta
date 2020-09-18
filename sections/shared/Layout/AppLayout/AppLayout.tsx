import { FC } from 'react';
import styled from 'styled-components';

import Header from './Header';

import { FlexDiv } from 'styles/common';

type AppLayoutProps = {
	children: React.ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
	<FullScreenContainer>
		<Header />
		{children}
	</FullScreenContainer>
);

const FullScreenContainer = styled(FlexDiv)`
	flex-flow: column;
	width: 100%;
	height: 100vh;
	position: relative;
`;

export default AppLayout;
