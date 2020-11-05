import React, { FC } from 'react';

import Connector from './Connector';
import Etherscan from './Etherscan';
import OneInch from './OneInch';

type WithAppContainersProps = {
	children: React.ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<Etherscan.Provider>
			<OneInch.Provider>{children}</OneInch.Provider>
		</Etherscan.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
