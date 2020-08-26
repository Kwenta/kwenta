import React, { FC } from 'react';

import Connector from './Connector';
import Contracts from './Contracts';
import Etherscan from './Etherscan';

type WithStateContainersProps = {
	children: React.ReactNode;
};

export const WithStateContainers: FC<WithStateContainersProps> = ({ children }) => (
	<Connector.Provider>
		<Contracts.Provider>
			<Etherscan.Provider>{children}</Etherscan.Provider>
		</Contracts.Provider>
	</Connector.Provider>
);

export default WithStateContainers;
