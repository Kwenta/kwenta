import { FC } from 'react';

import { FullScreenContainer, MobileScreenContainer } from 'styles/common';

import Header from './Header';
import NotificationContainer from 'constants/NotificationContainer';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import MobileUserMenu from './Header/MobileUserMenu';

type AppLayoutProps = {
	children: React.ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
	<>
		<MobileHiddenView>
			<FullScreenContainer>
				<Header />
				{children}
				<NotificationContainer />
			</FullScreenContainer>
		</MobileHiddenView>
		<MobileOnlyView>
			<MobileScreenContainer>
				{children}
				<MobileUserMenu />
			</MobileScreenContainer>
		</MobileOnlyView>
	</>
);

export default AppLayout;
