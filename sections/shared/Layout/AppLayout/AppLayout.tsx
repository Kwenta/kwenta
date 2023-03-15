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

const FooterContainer = styled.div`
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
				<div className="main-content">{children}</div>
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
	display: flex;
	flex-direction: column;

	.main-content {
		overflow-y: hidden;
		flex-grow: 1;
	}
`;

export default AppLayout;
