import { FC } from 'react';
import Footer from './Footer';

import Header from './Header';

type HomeLayoutProps = {
	children: React.ReactNode;
};

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => (
	<>
		<Header />
		{children}
		<Footer />
	</>
);

export default HomeLayout;
