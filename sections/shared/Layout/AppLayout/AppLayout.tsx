import { FC } from 'react';

import { FullScreenContainer } from 'styles/common';

import Header from './Header';

type AppLayoutProps = {
	children: React.ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
	<FullScreenContainer>
		<Header />
		{children}
	</FullScreenContainer>
);

export default AppLayout;
