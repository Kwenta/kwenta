import { FC } from 'react';

import { FullScreenContainer } from 'styles/common';

import Header from './Header';
import NotificationContainer from 'constants/NotificationContainer';
import { MobileOnlyView } from 'components/Media';
import MobileUserMenu from './Header/MobileUserMenu';

type AppLayoutProps = {
	children: React.ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
	<FullScreenContainer>
		<Header />
		{children}
		<NotificationContainer />
		<MobileOnlyView>
			<MobileUserMenu />
		</MobileOnlyView>
	</FullScreenContainer>
);

export default AppLayout;
