import { FC } from 'react';

import { FullScreenContainer } from 'styles/common';

import Header from './Header';
import NotificationContainer from 'constants/NotificationContainer';

type AppLayoutProps = {
	children: React.ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
	<FullScreenContainer>
		<Header />
		{children}
		<NotificationContainer />
	</FullScreenContainer>
);

export default AppLayout;
