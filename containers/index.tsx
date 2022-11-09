import React, { FC } from 'react';

import Connector from './Connector';

type WithAppContainersProps = {
	children: React.ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>{children}</Connector.Provider>
);

export default WithAppContainers;
