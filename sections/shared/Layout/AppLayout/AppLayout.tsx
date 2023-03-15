import { FC, memo } from 'react';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { Body } from 'components/Text';
import NotificationContainer from 'constants/NotificationContainer';
import { FullScreenContainer, MobileScreenContainer } from 'styles/common';

import GitHashID from './GitHashID';
import Header from './Header';
import MobileUserMenu from './Header/MobileUserMenu';

type AppLayoutProps = {
	children: React.ReactNode;
};

const Footer = () => {
	return (
		<FooterContainer>
			<Body>Fully operational</Body>
			<GitHashID />
			<div></div>
		</FooterContainer>
	);
};

const FooterContainer = styled.footer`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`;

const AppLayout: FC<AppLayoutProps> = memo(({ children }) => (
	<>
		<DesktopOnlyView>
			<STV>
				<Header />
				<main>{children}</main>
				<Footer />
			</STV>
		</DesktopOnlyView>
		<MobileOrTabletView>
			<MobileScreenContainer>
				{children}
				<MobileUserMenu />
			</MobileScreenContainer>
		</MobileOrTabletView>
		<NotificationContainer />
	</>
));

const STV = styled(FullScreenContainer)`
	display: grid;
	grid-template: 'header' auto 'main' 1fr 'footer' auto / 100%;

	> main {
		display: flex;
		min-height: 0;
		width: 100%;
	}
`;

export default AppLayout;
