import { FC } from 'react';

import Header from './Header';

type HomeLayoutProps = {
	children: React.ReactNode;
};

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => (
	<>
		<Header />
		{children}
	</>
);

export default HomeLayout;
