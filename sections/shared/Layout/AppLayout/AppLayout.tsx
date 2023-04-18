import { useRouter } from 'next/router';
import { FC, memo } from 'react';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import NotificationContainer from 'constants/NotificationContainer';
import { MobileScreenContainer } from 'styles/common';

import Banner from '../HomeLayout/Banner';
import Footer from './Footer';
import Header from './Header';
import MobileUserMenu from './Header/MobileUserMenu';

type AppLayoutProps = {
	children: React.ReactNode;
};

const AppLayout: FC<AppLayoutProps> = memo(({ children }) => {
	const router = useRouter();
	return (
		<AppLayoutContainer>
			<DesktopOnlyView>
				<DesktopGridContainer>
					<Header />
					{!router.pathname.startsWith('/dashboard') && <Banner compact={true} />}
					<main>{children}</main>
					<Footer />
				</DesktopGridContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileScreenContainer>
					<Banner />
					{children}
					<MobileUserMenu />
				</MobileScreenContainer>
			</MobileOrTabletView>
			<NotificationContainer />
		</AppLayoutContainer>
	);
});

const AppLayoutContainer = styled.div`
	height: 100%;

	> div {
		height: 100%;
	}
`;

const DesktopGridContainer = styled.div`
	width: 100%;
	height: 100%;
	display: grid;
	grid-template: auto 1fr auto / 100%;

	> main {
		display: flex;
		min-height: 0;
		width: 100%;

		> div {
			width: 100%;
			height: 100%;
		}
	}
`;

export default AppLayout;
