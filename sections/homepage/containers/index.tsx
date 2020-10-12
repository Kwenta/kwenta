import React, { FC } from 'react';

import SmoothScroll from './SmoothScroll';

type WithHomepageContainersProps = {
	children: React.ReactNode;
};

export const WithHomepageContainers: FC<WithHomepageContainersProps> = ({ children }) => (
	<SmoothScroll.Provider>{children}</SmoothScroll.Provider>
);

export default WithHomepageContainers;
