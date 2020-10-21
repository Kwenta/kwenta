import { FC } from 'react';
import styled from 'styled-components';

import { FullScreenContainer } from 'styles/common';

import Header from './Header';

type AppLayoutProps = {
	children: React.ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
	<StyledFullScreenContainer>
		<Header />
		{children}
	</StyledFullScreenContainer>
);

const StyledFullScreenContainer = styled(FullScreenContainer)`
	${(props) => props.theme.animations.show};
`;

export default AppLayout;
