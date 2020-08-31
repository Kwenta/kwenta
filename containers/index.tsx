import React, { FC } from 'react';

import Connector from './Connector';
import Etherscan from './Etherscan';

type WithStateContainersProps = {
	children: React.ReactNode;
};

export const WithStateContainers: FC<WithStateContainersProps> = ({ children }) => (
	<Connector.Provider>
		<Etherscan.Provider>{children}</Etherscan.Provider>
	</Connector.Provider>
);

export default WithStateContainers;
