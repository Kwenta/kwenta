import React, { FC } from 'react';

import Connector from './Connector';
import Services from './Services';
import Etherscan from './Etherscan';
import OneInch from './OneInch';

type WithAppContainersProps = {
	children: React.ReactNode;
};

export const WithAppContainers: FC<WithAppContainersProps> = ({ children }) => (
	<Connector.Provider>
		<Services.Provider>
			<Etherscan.Provider>
				<OneInch.Provider>{children}</OneInch.Provider>
			</Etherscan.Provider>
		</Services.Provider>
	</Connector.Provider>
);

export default WithAppContainers;
